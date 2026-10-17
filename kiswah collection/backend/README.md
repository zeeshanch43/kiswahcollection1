# Kiswah Collection — FastAPI Backend

Backend API for Kiswah Collection luxury Saudi fragrances with **FastAPI**, **Supabase (PostgreSQL)**, and automated local **Excel order backups**.

---

## 📁 Project Structure

```text
backend/
├── main.py               # FastAPI entry point, CORS middleware, routes & startup seeding
├── database.py           # Supabase / PostgreSQL connection & SessionLocal dependency
├── models.py             # SQLAlchemy models (products, orders)
├── schemas.py            # Pydantic schemas (ProductOut, OrderCreate, OrderOut)
├── requirements.txt      # Python dependencies
├── supabase_schema.sql   # Ready-to-run SQL for Supabase SQL Editor
├── .env.example          # Environment variables template
├── order_logs/           # Automatic Excel order backups (orders.xlsx)
└── static/images/        # Uploaded product imagery
```

---

## 🚀 Quick Setup & Run

### 1. Open Terminal in `backend` folder
```powershell
cd "Z:\kiswah collection\backend"
```

### 2. Create and Activate Virtual Environment
```powershell
python -m venv venv
.\venv\Scripts\activate
```

### 3. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 4. Configure `.env` file
Copy `.env.example` to `.env`:
```powershell
copy .env.example .env
```
Open `.env` and paste your Supabase credentials:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-or-service-role-key
DATABASE_URL=postgresql://postgres:your-db-password@db.your-project.supabase.co:5432/postgres
```

> **Note:** If `DATABASE_URL` is left blank, the app will automatically fall back to local SQLite at `order_logs/kiswah_local.db` so you can test immediately without any remote configuration!

### 5. Run Development Server
```powershell
uvicorn main:app --reload --port 8000
```

The API will be available at:
- **Base URL:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`
- **Alternative Redoc:** `http://127.0.0.1:8000/redoc`

---

## 🗄️ Supabase PostgreSQL Setup

You can either:
1. **Automatic:** Let SQLAlchemy create the tables automatically on server startup.
2. **Supabase SQL Editor (Recommended):**
   - Open your [Supabase Dashboard](https://supabase.com/dashboard).
   - Go to **SQL Editor** -> **New Query**.
   - Copy and paste the contents of `supabase_schema.sql` and click **Run**.

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API status and root endpoint |
| `GET` | `/api/products` | Get all products (supports `?category=Oud`) |
| `GET` | `/api/products/{id}` | Get product by ID |
| `POST` | `/api/products` | Create a new product |
| `POST` | `/api/orders` | Place order (Stores in DB + Logs to Excel) |
| `GET` | `/api/orders` | List all orders |
| `GET` | `/api/orders/export-excel` | Download latest `orders.xlsx` sheet |
