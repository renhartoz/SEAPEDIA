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

## 🔧 Environment Variables

Create a `.env` file in both the `client` and `server` directories by copying their respective `.env.example` files.

### Client (`client/.env`)
| Variable | Description | Default / Example |
|----------|-------------|-------------------|
| `VITE_API_URL` | Base URL for the backend API | `http://localhost:8000/api/v1` |

### Server (`server/.env`)
| Variable | Description | Default / Example |
|----------|-------------|-------------------|
| `DEBUG` | Enables Django debug mode | `True` |
| `SECRET_KEY` | Secret key for Django cryptographic operations | `API-KEY` |
| `DATABASE_URL` | PostgreSQL database connection string | `postgresql://user:pass@host/dbname` |
| `ALLOWED_HOSTS` | Comma-separated list of allowed host/domain names | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | Allowed origins for Cross-Origin Resource Sharing | `http://localhost:5173` |
| `SIMPLE_JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | Expiration time for JWT access tokens (in minutes) | `15` |
| `SIMPLE_JWT_REFRESH_TOKEN_LIFETIME_DAYS` | Expiration time for JWT refresh tokens (in days) | `7` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for media storage | *your_cloud_name* |
| `CLOUDINARY_API_KEY` | Cloudinary API key | *your_api_key* |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | *your_api_secret*

## 📦 Setup Instructions

### 1. Database Setup
Create a PostgreSQL database named `seapedia`.
```sql
CREATE DATABASE seapedia;
```

### 2. Setup

## Backend
```bash
cd server
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
```

## Frontend
```bash
cd client
npm install
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
cd server
python manage.py runserver
```

### 5. Frontend Setup
```bash
cd client
npm run dev
```

## 🔒 Security Notes

- **Role-Based Access Control:** Role switching and access control is enforced at the database level (`IsActiveSeller`, `IsActiveBuyer`, etc.). Active role is stored securely in the JWT token.
- **Atomic Operations:** Important transitions like processing checkouts, refunding wallets, and taking delivery jobs utilize `select_for_update()` and `transaction.atomic()` to prevent race conditions.
- **XSS Protection:** All user-generated content (like store names, descriptions, and reviews) is rendered as safe text nodes in React. There is no `dangerouslySetInnerHTML`.
- **SQL Injection:** Use Django's ORM for all database operations, avoiding raw SQL queries.

## 📖 Business Rules

- **Single-Store Checkout:** A buyer's cart can only contain items from a single store at any time.
- **Order Lifecycle:** Sedang Dikemas (Created) -> Menunggu Pengirim (Seller processed) -> Sedang Dikirim (Driver taken) -> Pesanan Selesai (Driver completed).
- **Service Level Agreements (SLA):** Instant (1 Day), Next Day (2 Days), Regular (5 Days). Overdue orders trigger automatic full refunds and stock restorations.
- **Admin Cron Job:** Admin triggers the `simulate_next_day` command to process SLAs and refunds for demonstration. In production, this can be scheduled as a daily cron job.

## 🌐 Live Deployment

- **Client:** [https://seapedia.renhartoz.tech/](https://seapedia.renhartoz.tech/)
- **Server API:** [https://api.seapedia.renhartoz.tech/](https://api.seapedia.renhartoz.tech/)

> [!NOTE]
> You can view and interact with the API documentation (Swagger) at: [https://api.seapedia.renhartoz.tech/api/docs/](https://api.seapedia.renhartoz.tech/api/docs/)
