from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta


class Command(BaseCommand):
    help = "Seed demo accounts, store, products, vouchers, and promo for testing."

    def handle(self, *args, **options):
        from accounts.models import User, UserRole
        from stores.models import Store
        from catalog.models import Product
        from wallet.models import Wallet
        from accounts.models import DeliveryAddress
        from discounts.models import Voucher, Promo
        from reviews.models import AppReview

        admin = self._create_user("admin", "admin@seapedia.id", "Admin1234!", "admin")
        seller = self._create_user("seller_demo", "seller@seapedia.id", "Seller1234!", "seller")
        seller2 = self._create_user("seller2_demo", "seller2@seapedia.id", "Seller1234!", "seller")
        buyer = self._create_user("buyer_demo", "buyer@seapedia.id", "Buyer1234!", "buyer")
        driver = self._create_user("driver_demo", "driver@seapedia.id", "Driver1234!", "driver")

        store, _ = Store.objects.get_or_create(
            seller=seller,
            defaults={"name": "Tech Store", "description": "The official SEAPEDIA tech store."},
        )

        store2, _ = Store.objects.get_or_create(
            seller=seller2,
            defaults={"name": "Fashion Hub", "description": "Premium clothing and apparel."},
        )

        products_store1 = [
            ("Laptop SEAPEDIA Pro", "Powerful laptop for developers.", Decimal("12000000"), 10),
            ("Mechanical Keyboard", "RGB mechanical keyboard.", Decimal("850000"), 25),
            ("Ergonomic Mouse", "Wireless ergonomic mouse.", Decimal("450000"), 30),
            ("4K Monitor", "27-inch IPS 4K display.", Decimal("5500000"), 8),
            ("USB-C Hub", "7-in-1 USB-C hub.", Decimal("350000"), 50),
        ]

        for name, desc, price, stock in products_store1:
            Product.objects.get_or_create(
                store=store, name=name,
                defaults={"description": desc, "price": price, "stock": stock},
            )

        products_store2 = [
            ("Running Shoes Pro", "Comfortable and durable running shoes.", Decimal("650000"), 20),
            ("Denim Jacket Classic", "Stylish classic blue denim jacket.", Decimal("450000"), 15),
            ("Cotton T-Shirt", "100% pure cotton breathable t-shirt.", Decimal("150000"), 100),
            ("Travel Backpack", "Water-resistant travel backpack 30L.", Decimal("350000"), 40),
        ]

        for name, desc, price, stock in products_store2:
            Product.objects.get_or_create(
                store=store2, name=name,
                defaults={"description": desc, "price": price, "stock": stock},
            )

        wallet, _ = Wallet.objects.get_or_create(buyer=buyer)
        wallet.balance = Decimal("5000000")
        wallet.save()

        DeliveryAddress.objects.get_or_create(
            user=buyer,
            label="Home",
            defaults={
                "recipient_name": "Demo Buyer",
                "phone": "08123456789",
                "street": "Jl. SEAPEDIA No. 1",
                "city": "Jakarta",
                "province": "DKI Jakarta",
                "postal_code": "10110",
                "is_default": True,
            },
        )

        expiry = date.today() + timedelta(days=30)

        Voucher.objects.get_or_create(
            code="SAVE50K",
            defaults={
                "discount_type": "fixed",
                "discount_value": Decimal("50000"),
                "expiry_date": expiry,
                "max_uses": 100,
                "created_by": admin,
            },
        )

        Voucher.objects.get_or_create(
            code="DISC10PCT",
            defaults={
                "discount_type": "percentage",
                "discount_value": Decimal("10"),
                "expiry_date": expiry,
                "max_uses": 50,
                "created_by": admin,
            },
        )

        Promo.objects.get_or_create(
            code="WELCOME20",
            defaults={
                "discount_type": "percentage",
                "discount_value": Decimal("20"),
                "expiry_date": expiry,
                "is_active": True,
                "created_by": admin,
            },
        )

        reviews_data = [
            ("Alice", 5, "Amazing platform, the single-store checkout is super smooth!"),
            ("Budi", 4, "Fast delivery with the instant option. Recommended."),
            ("Citra", 5, "I love the UI and the discounts work perfectly!"),
            ("Dimas", 5, "As a seller, the dashboard makes managing orders so easy."),
        ]
        
        for name, rating, comment in reviews_data:
            AppReview.objects.get_or_create(
                reviewer_name=name,
                defaults={"rating": rating, "comment": comment},
            )

        self.stdout.write(self.style.SUCCESS(
            "Seeded: admin / seller_demo / seller2_demo / buyer_demo / driver_demo\n"
            "Stores: Tech Store, Fashion Hub\n"
            "Vouchers: SAVE50K, DISC10PCT | Promo: WELCOME20\n"
            "Buyer wallet: Rp 5,000,000\n"
            "Reviews added: 4"
        ))

    def _create_user(self, username, email, password, role):
        from accounts.models import User, UserRole
        user, created = User.objects.get_or_create(username=username, defaults={"email": email})
        if created:
            user.set_password(password)
            user.save()
        UserRole.objects.get_or_create(user=user, role=role)
        return user
