from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from datetime import timedelta


SLA_DAYS = {
    "instant": 1,
    "next_day": 2,
    "regular": 5,
}


def process_overdue_orders():
    from orders.models import Order, OrderStatusHistory
    from delivery.models import DeliveryJob
    from wallet.models import Wallet, WalletTransaction
    from catalog.models import Product

    now = timezone.now()
    processed = []

    active_jobs = DeliveryJob.objects.filter(
        status="taken"
    ).select_related("order__buyer", "order")

    for job in active_jobs:
        order = job.order
        if order.refunded_at is not None:
            continue

        sla_days = SLA_DAYS.get(order.delivery_method, 5)
        deadline = job.taken_at + timedelta(days=sla_days)

        if now <= deadline:
            continue

        with transaction.atomic():
            locked_order = Order.objects.select_for_update().get(pk=order.pk)
            if locked_order.refunded_at is not None:
                continue

            locked_order.refunded_at = now
            locked_order.status = "Dikembalikan"
            locked_order.save(update_fields=["refunded_at", "status"])

            wallet, _ = Wallet.objects.select_for_update().get_or_create(buyer=locked_order.buyer)
            wallet.balance += locked_order.total
            wallet.save(update_fields=["balance", "updated_at"])

            WalletTransaction.objects.create(
                wallet=wallet,
                transaction_type="refund",
                amount=locked_order.total,
                description=f"Refund for overdue Order#{locked_order.pk}",
            )

            for item in locked_order.items.select_related("product").all():
                if item.product:
                    product = Product.objects.select_for_update().get(pk=item.product_id)
                    product.stock += item.quantity
                    product.save(update_fields=["stock"])

            OrderStatusHistory.objects.create(
                order=locked_order,
                status="Dikembalikan",
                note="Auto-returned due to overdue SLA",
            )

            job_locked = DeliveryJob.objects.select_for_update().get(pk=job.pk)
            job_locked.status = "completed"
            job_locked.completed_at = now
            job_locked.save(update_fields=["status", "completed_at"])

            processed.append(locked_order.pk)

    return processed
