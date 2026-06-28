from decimal import Decimal

DELIVERY_FEES = {
    "instant": Decimal("25000"),
    "next_day": Decimal("15000"),
    "regular": Decimal("10000"),
}

PPN_RATE = Decimal("0.12")


def calculate_pricing(items, delivery_method, discount_amount=Decimal("0")):
    subtotal = sum(item["price"] * item["quantity"] for item in items)
    discounted = max(subtotal - discount_amount, Decimal("0"))
    delivery_fee = DELIVERY_FEES[delivery_method]
    total_before_tax = discounted + delivery_fee
    ppn_amount = (total_before_tax * PPN_RATE).quantize(Decimal("0.01"))
    total = total_before_tax + ppn_amount
    return {
        "subtotal": subtotal,
        "discount_amount": discount_amount,
        "delivery_fee": delivery_fee,
        "ppn_amount": ppn_amount,
        "total": total,
    }
