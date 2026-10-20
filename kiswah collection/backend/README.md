# Kiswah Collection — FastAPI Backend

Backend API for Kiswah Collection luxury Saudi fragrances with **FastAPI**, **Supabase (PostgreSQL)**, and automated local **Excel order backups**.

---

## 📁 Project Structure

```text
backend/
├── main.py               # FastAPI entry point, CORS middleware, routes & startup seeding
├── database.py           # Supabase / PostgreSQL connection & SessionLocal dependency
├── storage.py            # Supabase Storage uploads for product images (local fallback)
├── models.py             # SQLAlchemy models (products, orders)
├── schemas.py            # Pydantic schemas (ProductOut, OrderCreate, OrderOut)
├── requirements.txt      # Python dependencies
├── supabase_schema.sql   # Ready-to-run SQL for Supabase SQL Editor (tables + storage bucket)
├── .env.example          # Environment variables template
├── order_logs/           # Automatic Excel order backups (orders.xlsx)
└── static/images/        # Local fallback for uploaded product imagery
```

---

## 🚀 Quick Setup & Run

### 1. Open Terminal in the project root (the folder that contains `backend/`)
```powershell
cd "D:\path\to\kiswah collection"
```

### 2. Create and Activate Virtual Environment
```powershell
python -m venv venv
.\venv\Scripts\activate
```

### 3. Install Dependencies
```powershell
pip install -r backend\requirements.txt
```

### 4. Configure `.env` file
Copy `.env.example` to `.env`:
```powershell
copy backend\.env.example backend\.env
```
Open `backend\.env` and paste your Supabase credentials:
```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-supabase-service-role-key
SUPABASE_STORAGE_BUCKET=product-images
DATABASE_URL=postgresql://postgres:your_db_password@db.your-project-ref.supabase.co:5432/postgres?sslmode=require
```

> **Note:** If `DATABASE_URL` is left blank, the app will automatically fall back to local SQLite at `order_logs/kiswah_local.db` so you can test immediately without any remote configuration!

### 5. Run Development Server
```powershell
python -m uvicorn backend.main:app --reload --port 8000
```

The API will be available at:
- **Base URL:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`
- **Alternative Redoc:** `http://127.0.0.1:8000/redoc`

---

## 🗄️ Supabase Setup (Database + Storage)

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Open **SQL Editor → New query**, paste the entire contents of `supabase_schema.sql`
   (tables, indexes, RLS policies **and** the `product-images` storage bucket) → **Run**.
3. Copy credentials into `backend/.env`:
   - **Project Settings → API**: `Project URL` → `SUPABASE_URL`,
     `service_role` secret → `SUPABASE_KEY` (keep this secret — server-side only).
   - **Project Settings → Database → Connection string URI** → `DATABASE_URL`.
4. Restart the backend. Startup log should no longer mention the SQLite fallback, and
   `GET /api/products` returns the rows created by Supabase (seeded on first run if empty).
5. Optional check: open `https://<project-ref>.supabase.co/storage/v1/object/public/product-images/…`
   after uploading an image.

**Image storage:** `POST /api/upload-image` stores files in the public
`product-images` bucket and returns the public URL, which is saved on the product via
`PATCH /api/products/{id}` (`{"image_url": "..."}`). The storefront admin at `/admin`
does both from the browser. If Supabase is not configured, images fall back to
`backend/static/images/`.

**Admin auth:** `/admin` signs in with `ADMIN_USERNAME` / `ADMIN_PASSWORD`
(default `kiswah` / `kiswah6767`, set in `backend/.env`). Login returns a session
token (valid 24h) that is sent as the `X-Admin-Token` header on every protected
request; restarting the backend invalidates sessions. The password can be changed
from inside the panel (`POST /api/admin/change-password`), which writes the new
value back into `backend/.env` so it survives restarts. Protected endpoints:
product create/update/delete, image upload, order listing and Excel export.

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API status and root endpoint |
| `GET` | `/api/products` | Get all products (supports `?category=Oud`) |
| `GET` | `/api/products/{id}` | Get product by ID |
| `POST` | `/api/products` | Create a new product |
| `PATCH` | `/api/products/{id}` | Partial update (e.g. set `image_url`, `stock`, `price_pkr`) |
| `DELETE` | `/api/products/{id}` | Delete a product |
| `POST` | `/api/upload-image` | Multipart upload to Supabase Storage → `{ "url": "https://..." }` |
| `POST` | `/api/orders` | Place order (Stores in DB + Logs to Excel) |
| `GET` | `/api/orders` | List all orders |
| `GET` | `/api/orders/export-excel` | Download latest `orders.xlsx` sheet |
| `POST` | `/api/admin/login` | `{"username", "password"}` → `{ "token": "..." }` |
| `POST` | `/api/admin/logout` | Invalidate the current session token |
| `GET` | `/api/admin/verify` | Check whether `X-Admin-Token` is still valid |
| `POST` | `/api/admin/change-password` | `{"current_password", "new_password"}` (saved to `.env`) |
