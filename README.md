# SEAPEDIA
Premium multi-tenant marketplace platform.

SEAPEDIA supports three user roles simultaneously: Buyers, Sellers, and Drivers, and features a single-store checkout system.

## 🚀 Technology Stack
- **Backend:** Django, Django REST Framework, PostgreSQL
- **Frontend:** React, Tailwind CSS v4, shadcn/ui, Vite

## ⚙️ Requirements
- Python 3.14+
- Node.js 22+
- PostgreSQL 18+

## 📦 Setup Instructions

### 1. Database Setup
Create a PostgreSQL database named `seapedia`.
```sql
CREATE DATABASE seapedia;
```

### 2. Backend Setup
```bash
cd server
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
```

### 3. Seed Demo Data
To test the platform, you can seed demo accounts, a store, products, and a wallet balance:
```bash
python manage.py seed_demo_data
```
This creates the following users (The default password is `${USER_ROLE}123!` e.g. `Admin123!`, `Seller1234!`, `Buyer1234!`, `Driver1234!`):
- Admin: `admin` / `admin@seapedia.id`
- Seller: `seller_demo` / `seller@seapedia.id`
- Buyer: `buyer_demo` / `buyer@seapedia.id` (Starts with Rp 5,000,000 balance)
- Driver: `driver_demo` / `driver@seapedia.id`

### 4. Run Backend Server
```bash
python manage.py runserver
```

### 5. Frontend Setup
```bash
cd client
npm install
npm run dev
```

## 🔒 Security Notes

- **Role-Based Access Control:** Role switching and access control is enforced at the database level (`IsActiveSeller`, `IsActiveBuyer`, etc.). Active role is stored securely in the JWT token.
- **Atomic Operations:** Important transitions like processing checkouts, refunding wallets, and taking delivery jobs utilize `select_for_update()` and `transaction.atomic()` to prevent race conditions.
- **XSS Protection:** All user-generated content (like store names, descriptions, and reviews) is rendered as safe text nodes in React. We do not use `dangerouslySetInnerHTML`.
- **SQL Injection:** We use Django's ORM for all database operations, avoiding raw SQL queries.

## 📖 Business Rules

- **Single-Store Checkout:** A buyer's cart can only contain items from a single store at any time.
- **Order Lifecycle:** Sedang Dikemas (Created) -> Menunggu Pengirim (Seller processed) -> Sedang Dikirim (Driver taken) -> Pesanan Selesai (Driver completed).
- **Service Level Agreements (SLA):** Instant (1 Day), Next Day (2 Days), Regular (5 Days). Overdue orders trigger automatic full refunds and stock restorations.
- **Admin Cron Job:** Admin triggers the `simulate_next_day` command to process SLAs and refunds for demonstration. In production, this can be scheduled as a daily cron job.
