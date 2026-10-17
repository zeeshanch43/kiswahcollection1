import json
import os
from datetime import datetime
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import openpyxl

from .database import engine, Base, get_db
from .models import Product, Order
from .schemas import ProductCreate, ProductOut, OrderCreate, OrderOut

# -----------------------------------------------------------------------------
# Base Directories
# -----------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
IMAGES_DIR = STATIC_DIR / "images"
ORDER_LOGS_DIR = BASE_DIR / "order_logs"
EXCEL_PATH = ORDER_LOGS_DIR / "orders.xlsx"

STATIC_DIR.mkdir(parents=True, exist_ok=True)
IMAGES_DIR.mkdir(parents=True, exist_ok=True)
ORDER_LOGS_DIR.mkdir(parents=True, exist_ok=True)

# -----------------------------------------------------------------------------
# FastAPI App Initialization
# -----------------------------------------------------------------------------
app = FastAPI(
    title="Kiswah Collection API",
    version="1.0.0",
    description="Backend API for Kiswah Collection Luxury Saudi Fragrances with Supabase PostgreSQL and Excel Logging",
)

# -----------------------------------------------------------------------------
# CORS Middleware Configuration
# -----------------------------------------------------------------------------
# Allow requests from frontend development servers and production domains
origins_env = os.getenv("CORS_ORIGINS", "")
allowed_origins = [o.strip() for o in origins_env.split(",") if o.strip()]

if not allowed_origins:
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in allowed_origins else allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directory for fragrance imagery
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


# -----------------------------------------------------------------------------
# Excel Logging Helper
# -----------------------------------------------------------------------------
def log_order_to_excel(order: Order):
    """Appends order details to order_logs/orders.xlsx for local backup."""
    try:
        if not EXCEL_PATH.exists():
            wb = openpyxl.Workbook()
            ws = wb.active
            ws.title = "Orders"
            ws.append([
                "Order ID",
                "Timestamp",
                "Customer Name",
                "Phone Number",
                "Shipping Address",
                "Total (PKR)",
                "Payment Method",
                "Status",
                "Items Details",
            ])
        else:
            wb = openpyxl.load_workbook(EXCEL_PATH)
            ws = wb.active

        # Format items for clean spreadsheet readability
        items_summary = order.items_json
        try:
            parsed = json.loads(order.items_json)
            if isinstance(parsed, list):
                items_summary = ", ".join(
                    [f"{i.get('name', 'Item')} x{i.get('quantity', 1)}" for i in parsed]
                )
        except Exception:
            pass

        ws.append([
            order.id,
            order.created_at.strftime("%Y-%m-%d %H:%M:%S") if order.created_at else datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            order.customer_name,
            order.phone_number,
            order.shipping_address,
            order.total_amount,
            order.payment_method,
            order.status,
            items_summary,
        ])
        wb.save(EXCEL_PATH)
        print(f"[✓] Order #{order.id} backed up to {EXCEL_PATH}")
    except Exception as e:
        print(f"[!] Warning: Could not log order to Excel: {e}")


# -----------------------------------------------------------------------------
# Database Startup & Initial Seeding
# -----------------------------------------------------------------------------
@app.on_event("startup")
def on_startup():
    # Automatically create tables in PostgreSQL / SQLite
    Base.metadata.create_all(bind=engine)

    # Seed default Kiswah Collection fragrances if table is empty
    db = next(get_db())
    try:
        if db.query(Product).count() == 0:
            print("[*] Seeding default Kiswah Collection products into database...")
            default_products = [
                Product(
                    name="Amber Oud",
                    category="Oud",
                    price_pkr=8500.0,
                    volume="100ml",
                    top_notes="Saffron",
                    heart_notes="Cambodian Oud",
                    base_notes="Amber",
                    description="A regal blend of smoky Cambodian oud wrapped in warm amber and a whisper of saffron. Crafted in Riyadh for those who leave a lasting impression.",
                    longevity=5,
                    stock=50,
                ),
                Product(
                    name="Dahn Al Oud Royale",
                    category="Attar",
                    price_pkr=6500.0,
                    volume="12ml",
                    top_notes="Bergamot",
                    heart_notes="Aged Oud Oil",
                    base_notes="Sandalwood",
                    description="Pure concentrated attar oil, alcohol-free and aged for richness. A few drops last all day on skin and clothing.",
                    longevity=5,
                    stock=30,
                ),
                Product(
                    name="Ward Taifi",
                    category="Floral",
                    price_pkr=4500.0,
                    volume="50ml",
                    top_notes="Pink Pepper",
                    heart_notes="Taif Rose",
                    base_notes="White Musk",
                    description="The legendary Taif rose of the Hijaz mountains, softened with clean white musk. Elegant, feminine and timeless.",
                    longevity=4,
                    stock=40,
                ),
                Product(
                    name="Musk Al Tahara",
                    category="Musk",
                    price_pkr=3800.0,
                    volume="50ml",
                    top_notes="Lily",
                    heart_notes="Powdery Musk",
                    base_notes="Vanilla",
                    description="A creamy, comforting white musk inspired by the traditional Musk Tahara. Soft and close to the skin.",
                    longevity=3,
                    stock=60,
                ),
                Product(
                    name="Sandal Majlis",
                    category="Woody",
                    price_pkr=7200.0,
                    volume="100ml",
                    top_notes="Cardamom",
                    heart_notes="Mysore Sandalwood",
                    base_notes="Cedar",
                    description="The warmth of a Saudi majlis — spiced cardamom over creamy sandalwood and dry cedar.",
                    longevity=4,
                    stock=35,
                ),
                Product(
                    name="Oud Mubakhar",
                    category="Oud",
                    price_pkr=9800.0,
                    volume="75ml",
                    top_notes="Rose",
                    heart_notes="Bakhoor Smoke",
                    base_notes="Agarwood",
                    description="Inspired by incense-perfumed homes on Eid. Deep agarwood, smouldering bakhoor and a touch of rose.",
                    longevity=5,
                    stock=25,
                ),
                Product(
                    name="Nasim Al Sahra",
                    category="Fresh",
                    price_pkr=4200.0,
                    volume="100ml",
                    top_notes="Citrus",
                    heart_notes="Sea Breeze",
                    base_notes="Ambergris",
                    description="A cool desert breeze at dawn. Sparkling citrus and marine accords over a soft ambergris base.",
                    longevity=3,
                    stock=45,
                ),
                Product(
                    name="Jannat Al Firdaus",
                    category="Attar",
                    price_pkr=2500.0,
                    volume="6ml",
                    top_notes="Green Leaves",
                    heart_notes="Jasmine",
                    base_notes="Musk",
                    description="A classic, beloved attar — green, floral and gently musky. Concentrated oil, ideal for daily wear.",
                    longevity=4,
                    stock=70,
                ),
            ]
            db.add_all(default_products)
            db.commit()
            print("[✓] Seeded 8 default Kiswah Collection products.")
    except Exception as e:
        print(f"[!] Startup seeding error: {e}")
    finally:
        db.close()


# -----------------------------------------------------------------------------
# API Endpoints
# -----------------------------------------------------------------------------
@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Kiswah Collection API",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "products": "/api/products",
            "orders": "/api/orders",
            "excel_backup": "/api/orders/export-excel",
        },
    }


# Products Endpoints
@app.get("/api/products", response_model=List[ProductOut])
def get_products(
    category: Optional[str] = Query(None, description="Filter by category (Oud, Attar, Floral, etc.)"),
    db: Session = Depends(get_db),
):
    query = db.query(Product)
    if category and category.lower() != "all":
        query = query.filter(Product.category.ilike(category))
    return query.all()


@app.get("/api/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.post("/api/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    product = Product(**payload.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


# Orders Endpoints (Matches frontend CartDrawer POST request)
@app.post("/api/orders", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def place_order(payload: OrderCreate, db: Session = Depends(get_db)):
    # Support both nested storefront schema and direct schema
    if payload.customer:
        customer_name = payload.customer.full_name
        phone_number = payload.customer.phone
        shipping_address = payload.customer.address
        total_amount = payload.total or 0.0
        items_serialized = json.dumps([i.dict() for i in (payload.items or [])])
        payment_method = payload.payment_method or "COD"
    else:
        customer_name = payload.customer_name or "Guest"
        phone_number = payload.phone_number or ""
        shipping_address = payload.shipping_address or ""
        total_amount = payload.total_amount or 0.0
        if isinstance(payload.items_json, (list, dict)):
            items_serialized = json.dumps(payload.items_json)
        else:
            items_serialized = str(payload.items_json or "[]")
        payment_method = payload.payment_method or "COD"

    if not customer_name.strip() or not phone_number.strip() or not shipping_address.strip():
        raise HTTPException(
            status_code=400,
            detail="Customer full name, phone number, and shipping address are required.",
        )

    order = Order(
        customer_name=customer_name,
        phone_number=phone_number,
        shipping_address=shipping_address,
        total_amount=float(total_amount),
        items_json=items_serialized,
        payment_method=payment_method,
        status="pending",
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    # Local Excel Backup
    log_order_to_excel(order)

    return order


@app.get("/api/orders", response_model=List[OrderOut])
def list_orders(db: Session = Depends(get_db)):
    return db.query(Order).order_by(Order.id.desc()).all()


@app.get("/api/orders/export-excel")
def download_excel_orders():
    """Download the current Excel sheet containing all placed orders."""
    if not EXCEL_PATH.exists():
        raise HTTPException(status_code=404, detail="No orders have been logged to Excel yet.")
    return FileResponse(
        path=str(EXCEL_PATH),
        filename="kiswah_orders.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
