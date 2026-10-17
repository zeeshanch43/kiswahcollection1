from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.sql import func
from .database import Base


class Product(Base):
    """Product model representing Saudi perfumes, attars, and ouds."""
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)  # e.g. Oud, Attar, Floral, Musk, Woody, Fresh
    price_pkr = Column(Float, nullable=False)
    volume = Column(String(50), default="100ml", nullable=True)
    top_notes = Column(String(255), nullable=True)
    heart_notes = Column(String(255), nullable=True)
    base_notes = Column(String(255), nullable=True)
    image_url = Column(String(500), nullable=True)
    stock = Column(Integer, default=50, nullable=False)
    description = Column(Text, nullable=True)
    longevity = Column(Integer, default=4, nullable=True)  # Scale 1-5
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow)


class Order(Base):
    """Order model representing customer orders placed via the store checkout."""
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_name = Column(String(200), nullable=False)
    phone_number = Column(String(50), nullable=False, index=True)
    shipping_address = Column(Text, nullable=False)
    total_amount = Column(Float, nullable=False)
    items_json = Column(Text, nullable=False)  # Stored as serialized JSON string
    payment_method = Column(String(50), default="COD", nullable=False)
    status = Column(String(50), default="pending", nullable=False)  # pending, confirmed, shipped, delivered, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now(), default=datetime.utcnow)
