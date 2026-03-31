# XIV-STORE / TrueFIT — Developer Guide

A full-stack streetwear e-commerce storefront.

- **Frontend** — React + Vite + Tailwind CSS (served on port `5173`)
- **Backend** — Django 4.2 + Django REST Framework (served on port `8000`)
- **Database** — SQLite (local dev) or MySQL 8+ (production)
- **Payments** — M-Pesa (Safaricom Daraja API) via STK Push

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Quick Start (Local Development)](#2-quick-start-local-development)
3. [MySQL Database Setup (Production)](#3-mysql-database-setup-production)
4. [Database Schema Reference](#4-database-schema-reference)
5. [Adding Products & Collections](#5-adding-products--collections)
6. [M-Pesa Checkout Setup](#6-m-pesa-checkout-setup)
7. [API Reference](#7-api-reference)
8. [Environment Variables](#8-environment-variables)
9. [Security & Rate Limiting](#9-security--rate-limiting)
10. [Going to Production](#10-going-to-production)

---

## 1. Project Structure

```
XIV-STORE/
├── Frontend/                   # React + Vite storefront
│   ├── src/
│   │   ├── api.ts              # ★ Centralised API layer — all fetch calls go here
│   │   ├── pages/
│   │   │   ├── Admin/
│   │   │   │   ├── AddProduct.tsx   # Admin: create a product (with validation)
│   │   │   │   └── Dashboard.tsx    # Admin: manage products table
│   │   │   ├── CheckoutPage.tsx     # 3-step checkout with M-Pesa STK Push
│   │   │   ├── HomePage.tsx
│   │   │   ├── ShopPage.tsx
│   │   │   └── CollectionsPage.tsx
│   │   ├── context/            # React contexts (Cart, UI, Toast)
│   │   ├── components/         # Reusable UI components
│   │   └── types/              # TypeScript interfaces
│   ├── .env                    # ← create this (see §8)
│   └── .env.example
│
└── truefit_backend/            # Django REST API
    ├── products/
    │   ├── models.py           # Product & Collection database models
    │   ├── serializers.py      # Input validation + data shapes
    │   ├── views.py            # API views with rate limiting
    │   ├── urls.py             # API routes
    │   ├── admin.py            # Django Admin config
    │   └── exceptions.py       # Consistent error response handler
    ├── payments/               # ← to be created (M-Pesa integration)
    │   ├── models.py           # Order & MpesaTransaction models
    │   ├── views.py            # STK Push + callback endpoints
    │   └── urls.py             # /api/mpesa/ routes
    ├── truefit_backend/
    │   └── settings.py         # ★ All config driven by .env — no hardcoded values
    ├── .env                    # ← create this (see §8)
    ├── .env.example
    └── requirements.txt
```

---

## 2. Quick Start (Local Development)

### Prerequisites

- Python 3.10+
- Node.js 18+ & npm
- git

### Backend Setup

```powershell
# 1. Navigate to the backend
cd truefit_backend

# 2. (Recommended) create a virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Create your environment file
copy .env.example .env
# Open .env and review the settings.
# The defaults work out-of-the-box with SQLite (no MySQL needed yet).

# 5. Run database migrations
python manage.py makemigrations
python manage.py migrate

# 6. Create an admin user
python manage.py createsuperuser
# You will be prompted for a username, email, and password.

# 7. Start the development server
python manage.py runserver
# API is now at http://127.0.0.1:8000
```

### Frontend Setup

Open a **second terminal** and run:

```powershell
cd Frontend

# 1. Install Node dependencies
npm install

# 2. Create your environment file
copy .env.example .env
# The default VITE_API_BASE_URL=http://127.0.0.1:8000 is correct for local dev.

# 3. Start the development server
npm run dev
# Storefront is now at http://localhost:5173
```

> **Both servers must be running at the same time.** The frontend talks to the backend on port 8000.

---

## 3. MySQL Database Setup (Production)

By default the project uses **SQLite** — a file on disk, zero configuration needed.
For production, switch to **MySQL 8+**:

### 3.1 Install MySQL (if not installed)

Download from [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/) and run the installer.

### 3.2 Create the database and user

Open a MySQL shell (`mysql -u root -p`) and run:

```sql
-- Create the database with full Unicode support
CREATE DATABASE truefit_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Create a dedicated database user (NEVER use root in production)
CREATE USER 'truefit_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';

-- Grant permissions only to this specific database
GRANT ALL PRIVILEGES ON truefit_db.* TO 'truefit_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Verify
SHOW DATABASES;
```

### 3.3 Switch the backend to MySQL

Open `truefit_backend/.env` and change:

```dotenv
# Change SQLite → MySQL
DB_ENGINE=mysql

# Fill in your MySQL credentials
DB_NAME=truefit_db
DB_USER=truefit_user
DB_PASSWORD=STRONG_PASSWORD_HERE
DB_HOST=localhost
DB_PORT=3306
```

Then re-run migrations:

```powershell
python manage.py migrate
python manage.py createsuperuser
```

---

## 4. Database Schema Reference

These are the tables Django creates automatically from the models.

### `products_product`

| Column       | Type          | Notes                                  |
|-------------|---------------|----------------------------------------|
| `id`        | BIGINT PK     | Auto-increment primary key             |
| `name`      | VARCHAR(200)  | Product display name                   |
| `slug`      | VARCHAR(50)   | URL-friendly identifier (auto-generated)|
| `description`| LONGTEXT     | Full product description               |
| `price`     | DECIMAL(10,2) | Price in Kenyan Shillings              |
| `image`     | VARCHAR(2000) | Uploaded image path (optional)         |
| `image_url` | VARCHAR(2000) | External image URL (optional)          |
| `stock`     | INT UNSIGNED  | Units in stock                         |
| `category`  | VARCHAR(100)  | e.g. `Tops`, `Hoodies`, `Bottoms`      |
| `sizes`     | JSON          | Array of sizes, e.g. `["S","M","L"]`  |
| `colors`    | JSON          | Array of colors, e.g. `["Black"]`     |
| `featured`  | TINYINT(1)    | Show in "Featured" section             |
| `newArrival`| TINYINT(1)    | Show in "New Arrivals" section         |
| `created_at`| DATETIME      | Auto-set on creation                   |
| `updated_at`| DATETIME      | Auto-updated on every save             |

### `products_collection`

| Column        | Type         | Notes                          |
|--------------|--------------|--------------------------------|
| `id`         | BIGINT PK    | Auto-increment primary key     |
| `name`       | VARCHAR(200) | e.g. `Winter 2026`             |
| `slug`       | VARCHAR(50)  | URL-friendly identifier        |
| `image`      | VARCHAR(2000)| Image for the collection card  |
| `description`| LONGTEXT     | Short description (optional)   |
| `created_at` | DATETIME     | Auto-set on creation           |

### `payments_order` *(created when M-Pesa is wired up)*

| Column           | Type          | Notes                                        |
|-----------------|---------------|----------------------------------------------|
| `id`            | BIGINT PK     | Auto-increment primary key                   |
| `reference`     | VARCHAR(20)   | Unique human-readable order number           |
| `customer_name` | VARCHAR(200)  | Full name from checkout form                 |
| `customer_email`| VARCHAR(254)  | Email for receipt                            |
| `phone_number`  | VARCHAR(20)   | M-Pesa phone number                          |
| `items`         | JSON          | Snapshot of cart at time of order            |
| `subtotal`      | DECIMAL(10,2) | Cart subtotal                                |
| `shipping`      | DECIMAL(10,2) | Shipping fee applied                         |
| `total`         | DECIMAL(10,2) | Final total charged                          |
| `status`        | VARCHAR(20)   | `pending` → `paid` → `fulfilled` / `failed` |
| `created_at`    | DATETIME      | Auto-set on creation                         |

### `payments_mpesatransaction` *(created when M-Pesa is wired up)*

| Column              | Type         | Notes                                         |
|--------------------|--------------|-----------------------------------------------|
| `id`               | BIGINT PK    | Auto-increment primary key                    |
| `order`            | FK → Order   | Linked order                                  |
| `checkout_request_id`| VARCHAR(100)| Safaricom's STK Push request ID              |
| `merchant_request_id`| VARCHAR(100)| Safaricom's merchant reference               |
| `mpesa_receipt`    | VARCHAR(50)  | M-Pesa confirmation code (e.g. `QGJ1KX...`)  |
| `result_code`      | INT          | `0` = success, anything else = failure        |
| `result_desc`      | VARCHAR(500) | Human-readable result from Safaricom          |
| `amount`           | DECIMAL(10,2)| Amount confirmed by Safaricom                 |
| `created_at`       | DATETIME     | Auto-set on creation                          |

---

## 5. Adding Products & Collections

You have **three ways** to add products:

### Method 1 — Django Admin Panel (Recommended)

1. Go to [http://127.0.0.1:8000/admin](http://127.0.0.1:8000/admin)
2. Log in with superuser credentials.
3. Click **Products → Add Product**.
4. Fill in the form:
   - **Name** — Product display name
   - **Price** — In Kenyan Shillings (e.g. `4500`)
   - **Image URL** — Paste a direct image link (from Unsplash, Cloudinary, etc.)
   - **Sizes (JSON)** — Enter as a JSON array: `["S", "M", "L", "XL"]`
   - **Colors (JSON)** — Enter as a JSON array: `["Black", "White"]`
   - **Featured** / **New Arrival** — Tick to feature on the homepage
   - **Stock** — Number of units available
5. Click **Save**.

The product appears instantly on the storefront.

### Method 2 — Frontend Admin Panel

1. Go to the storefront and navigate to `/admin-login`.
2. Log in (same superuser credentials).
3. Click **Add Product**.
4. Fill in the validated form (supports size/color toggles, category dropdown).
5. Click **Create Product** → redirects to dashboard.

### Method 3 — REST API (curl / Postman)

```bash
curl -X POST http://127.0.0.1:8000/api/products/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cargo Utility Pant",
    "description": "Heavy-duty cargo pants with 6 pockets and a relaxed fit.",
    "price": "4500.00",
    "stock": 30,
    "category": "Bottoms",
    "image_url": "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1",
    "sizes": ["S", "M", "L", "XL"],
    "colors": ["Black", "Olive"],
    "featured": false,
    "newArrival": true
  }'
```

### Adding a Collection

Follow the same steps as a Product but under **Collections** in the Django Admin.
A collection requires: `name`, `image` (URL), and an optional `description`.

---

## 6. M-Pesa Checkout Setup

The checkout uses **Safaricom Daraja API** for M-Pesa STK Push (Lipa Na M-Pesa).
When a customer clicks **Pay with M-Pesa**, they receive a push notification on their phone to confirm payment.

### 6.1 Register for a Daraja Account

1. Go to **[https://developer.safaricom.co.ke](https://developer.safaricom.co.ke)**
2. Click **Sign Up** and create an account.
3. Verify your email and log in.

### 6.2 Create a Daraja App

1. In the Daraja portal, go to **My Apps → Add a New App**.
2. Give the app a name (e.g. `TrueFIT Store`).
3. Select the **Lipa Na M-Pesa Sandbox** product.
4. Click **Create App**.
5. Open the app — you will see:
   - **Consumer Key** — copy this
   - **Consumer Secret** — copy this

### 6.3 Get Your Sandbox Test Credentials

In the Daraja portal go to **APIs → Lipa Na M-Pesa Online → Simulate** to find:

| Value             | Where to find it                                    |
|-------------------|-----------------------------------------------------|
| Business Shortcode| `174379` (Safaricom sandbox default)               |
| Passkey           | Listed on the Lipa Na M-Pesa Sandbox page           |
| Test phone number | Any Safaricom number, e.g. `254708374149`           |

> In the sandbox, no real money is charged. You can simulate payments right in the portal.

### 6.4 Add Your Credentials to the Backend `.env`

Open `truefit_backend/.env` and add:

```dotenv
# ─── M-Pesa / Daraja ──────────────────────────────────────────────────────────
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here

# For sandbox: 174379  |  For production: your real Paybill/Till number
MPESA_BUSINESS_SHORTCODE=174379

# From the Daraja portal — Lipa Na M-Pesa Online page
MPESA_PASSKEY=your_passkey_here

# sandbox or production
MPESA_ENVIRONMENT=sandbox

# The URL Safaricom will POST the payment result to (must be publicly accessible)
# For local testing use ngrok (see §6.5 below).
# For production: https://api.yourdomain.co.ke/api/mpesa/callback/
MPESA_CALLBACK_URL=https://YOUR_NGROK_URL/api/mpesa/callback/
```

> **NEVER commit your Consumer Key or Consumer Secret to Git.**
> They belong only in `.env`, which is listed in `.gitignore`.

### 6.5 Exposing Localhost for the Callback (Development Only)

Safaricom must be able to reach your callback URL over the internet.
During development, use **ngrok** to create a public tunnel to your local machine:

```powershell
# Install ngrok from https://ngrok.com/download
# Then run:
ngrok http 8000
```

ngrok will print a URL like `https://abc123.ngrok.io`.
Use that as your `MPESA_CALLBACK_URL` in `.env`:

```dotenv
MPESA_CALLBACK_URL=https://abc123.ngrok.io/api/mpesa/callback/
```

> Restart the Django server every time you update `.env`.
> ngrok URLs change each time you restart ngrok (unless you have a paid plan).

### 6.6 How the Payment Flow Works

```
Customer clicks "Pay with M-Pesa"
        │
        ▼
Frontend sends POST /api/mpesa/stkpush/
{ phone_number, amount, order_items, contact_info, shipping_info }
        │
        ▼
Django creates an Order (status = "pending")
Django calls Safaricom STK Push API
        │
        ▼
Safaricom sends a PIN prompt to the customer's phone
        │
   Customer enters PIN
        │
        ▼
Safaricom calls POST /api/mpesa/callback/
{ CheckoutRequestID, ResultCode, MpesaReceiptNumber, ... }
        │
        ▼
Django looks up the Order by CheckoutRequestID
    ResultCode 0?  →  Mark Order as "paid", clear cart
    ResultCode ≠ 0? →  Mark Order as "failed"
        │
        ▼
Customer sees success or error message
```

### 6.7 Tell Me When You're Ready

Once you have your **Consumer Key**, **Consumer Secret**, and **Passkey** from Daraja:

1. Add them to `truefit_backend/.env` as shown above.
2. Run ngrok and copy the public URL.
3. Tell me — I will build the complete Django `payments` app:
   - `Order` and `MpesaTransaction` models
   - STK Push endpoint (`POST /api/mpesa/stkpush/`)
   - Callback endpoint (`POST /api/mpesa/callback/`)
   - Admin panel for viewing orders
4. Wire the frontend checkout to the live endpoint.

### 6.8 Going Live with M-Pesa

When you're ready to accept real payments:

1. In the Daraja portal, go to **Go Live** and submit your business details.
2. Safaricom will review and approve (usually 2–5 business days).
3. You'll receive production credentials.
4. Update `.env`:
   ```dotenv
   MPESA_ENVIRONMENT=production
   MPESA_BUSINESS_SHORTCODE=your_real_paybill_or_till
   MPESA_CONSUMER_KEY=your_production_key
   MPESA_CONSUMER_SECRET=your_production_secret
   MPESA_PASSKEY=your_production_passkey
   MPESA_CALLBACK_URL=https://api.yourdomain.co.ke/api/mpesa/callback/
   ```
5. Restart the server — no code changes needed, only `.env` changes.

---

## 7. API Reference

Base URL: `http://127.0.0.1:8000` (development)

### Products & Collections

| Method | Endpoint                     | Description                          |
|--------|------------------------------|--------------------------------------|
| GET    | `/api/products/`             | List products (paginated)            |
| POST   | `/api/products/`             | Create a product                     |
| GET    | `/api/products/<id>/`        | Get a single product                 |
| PATCH  | `/api/products/<id>/`        | Update a product (partial)           |
| DELETE | `/api/products/<id>/`        | Delete a product                     |
| GET    | `/api/collections/`          | List all collections                 |
| POST   | `/api/collections/`          | Create a collection                  |
| GET    | `/api/collections/<id>/`     | Get a single collection              |
| PATCH  | `/api/collections/<id>/`     | Update a collection                  |
| DELETE | `/api/collections/<id>/`     | Delete a collection                  |

### Payments (M-Pesa) — *to be implemented*

| Method | Endpoint                    | Description                                      |
|--------|-----------------------------|--------------------------------------------------|
| POST   | `/api/mpesa/stkpush/`       | Initiate STK Push to customer's phone            |
| POST   | `/api/mpesa/callback/`      | Safaricom posts payment result here (webhook)    |
| GET    | `/api/orders/`              | List all orders (admin only)                     |
| GET    | `/api/orders/<ref>/`        | Get order by reference number                    |

### Query Parameters (GET /api/products/)

| Parameter   | Example                 | Description                          |
|-------------|-------------------------|--------------------------------------|
| `category`  | `?category=Hoodies`     | Filter by category                   |
| `featured`  | `?featured=true`        | Filter featured products             |
| `newArrival`| `?newArrival=true`      | Filter new arrivals                  |
| `search`    | `?search=cargo`         | Search name, description, category   |
| `ordering`  | `?ordering=-price`      | Sort (`-` prefix = descending)       |
| `page`      | `?page=2`               | Pagination (20 items per page)       |

---

## 8. Environment Variables

### Backend (`truefit_backend/.env`)

| Variable               | Default                             | Description                                    |
|------------------------|-------------------------------------|------------------------------------------------|
| `SECRET_KEY`           | *(insecure default)*                | Django secret key — **MUST change in prod**    |
| `DEBUG`                | `True`                              | Set to `False` in production                   |
| `ALLOWED_HOSTS`        | `127.0.0.1,localhost`               | Comma-separated allowed hostnames              |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,...`         | Comma-separated frontend origins               |
| `DB_ENGINE`            | `sqlite`                            | `sqlite` or `mysql`                            |
| `DB_NAME`              | `truefit_db`                        | MySQL database name                            |
| `DB_USER`              | `root`                              | MySQL username                                 |
| `DB_PASSWORD`          | *(empty)*                           | MySQL password                                 |
| `DB_HOST`              | `localhost`                         | MySQL host                                     |
| `DB_PORT`              | `3306`                              | MySQL port                                     |
| `MPESA_CONSUMER_KEY`   | *(required for checkout)*           | From Safaricom Daraja portal                   |
| `MPESA_CONSUMER_SECRET`| *(required for checkout)*           | From Safaricom Daraja portal                   |
| `MPESA_BUSINESS_SHORTCODE`| `174379` (sandbox)               | Your Paybill or Till number                    |
| `MPESA_PASSKEY`        | *(required for checkout)*           | From Daraja — Lipa Na M-Pesa Online page       |
| `MPESA_ENVIRONMENT`    | `sandbox`                           | `sandbox` or `production`                      |
| `MPESA_CALLBACK_URL`   | *(required for checkout)*           | Public URL Safaricom calls after payment       |

### Frontend (`Frontend/.env`)

| Variable            | Default                    | Description                         |
|---------------------|----------------------------|-------------------------------------|
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000`    | Backend API base URL                |

---

## 9. Security & Rate Limiting

### Rate Limiting (Built-in)

The API is protected with DRF's built-in throttling:

| Client Type      | Read Limit | Write Limit (POST/PATCH/DELETE) |
|-----------------|------------|---------------------------------|
| Anonymous users  | 100 / min  | 20 / min                        |
| Logged-in users  | 500 / min  | 20 / min                        |

If a client exceeds the limit they receive `HTTP 429 Too Many Requests`.

### Input Validation

All API inputs are validated server-side:
- **Price**: must be positive, cannot exceed 10,000,000
- **Stock**: cannot be negative
- **Name**: 3–200 characters
- **Description**: minimum 10 characters
- **Image URL**: must begin with `http://` or `https://`
- **Sizes / Colors**: must be valid JSON arrays of non-empty strings

### CORS

Only origins listed in `CORS_ALLOWED_ORIGINS` can make cross-origin requests to the API.
The default allows `localhost:5173`.

### Production Security Headers

When `DEBUG=False`, the following headers are automatically enabled:
- `Strict-Transport-Security` (HSTS, 1 year)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Secure` flag on session and CSRF cookies
- HTTPS redirect enforced

---

## 10. Going to Production

1. Generate a new `SECRET_KEY`:
   ```python
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```
2. Set `DEBUG=False` in backend `.env`.
3. Set `ALLOWED_HOSTS=yourdomain.co.ke,www.yourdomain.co.ke`.
4. Set `CORS_ALLOWED_ORIGINS=https://yourdomain.co.ke`.
5. Switch `DB_ENGINE=mysql` with strong credentials.
6. Collect static files: `python manage.py collectstatic`.
7. Set `VITE_API_BASE_URL=https://api.yourdomain.co.ke` in frontend `.env`.
8. Build the frontend: `npm run build` → deploy the `dist/` folder.
9. Put a reverse proxy (nginx / Caddy) in front of Gunicorn.
10. Set `MPESA_ENVIRONMENT=production` and update all M-Pesa credentials.
11. Point `MPESA_CALLBACK_URL` to your real domain (no ngrok in production).
