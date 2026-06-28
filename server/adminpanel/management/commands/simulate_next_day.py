from django.core.management.base import BaseCommand
from adminpanel.overdue import process_overdue_orders


class Command(BaseCommand):
    help = "Process overdue orders based on delivery SLA rules."

    def handle(self, *args, **options):
        processed = process_overdue_orders()
        if processed:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Processed {len(processed)} overdue order(s): {processed}"
                )
            )
        else:
            self.stdout.write("No overdue orders found.")
