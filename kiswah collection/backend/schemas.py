from datetime import datetime
from typing import List, Optional, Any, Union
from pydantic import BaseModel, Field


# -----------------------------------------------------------------------------
# Product Schemas
# -----------------------------------------------------------------------------
class ProductBase(BaseModel):
    name: str = Field(..., max_length=200, example="Amber Oud")
    category: str = Field(..., max_length=100, example="Oud")
    price_pkr: float = Field(..., gt=0, example=8500.0)
    volume: Optional[str] = Field(default="100ml", example="100ml")
    top_notes: Optional[str] = Field(None, example="Saffron")
    heart_notes: Optional[str] = Field(None, example="Cambodian Oud")
    base_notes: Optional[str] = Field(None, example="Amber")
    image_url: Optional[str] = Field(None, example="https://...")
    stock: int = Field(default=50, ge=0, example=50)
    description: Optional[str] = Field(None, example="A regal blend of smoky Cambodian oud...")
    longevity: Optional[int] = Field(default=5, ge=1, le=5, example=5)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    """Partial update payload — every field is optional."""

    name: Optional[str] = Field(None, max_length=200)
    category: Optional[str] = Field(None, max_length=100)
    price_pkr: Optional[float] = Field(None, gt=0)
    volume: Optional[str] = None
    top_notes: Optional[str] = None
    heart_notes: Optional[str] = None
    base_notes: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=500)
    stock: Optional[int] = Field(None, ge=0)
    description: Optional[str] = None
    longevity: Optional[int] = Field(None, ge=1, le=5)


class ProductOut(ProductBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# -----------------------------------------------------------------------------
# Admin Schemas
# -----------------------------------------------------------------------------
class AdminLoginRequest(BaseModel):
    username: str = Field(..., max_length=100, example="kiswah")
    password: str = Field(..., max_length=128)


class AdminPasswordChange(BaseModel):
    current_password: str = Field(..., max_length=128)
    new_password: str = Field(..., min_length=6, max_length=128)


# -----------------------------------------------------------------------------
# Order Schemas (Supports both frontend nested payload and direct flat payload)
# -----------------------------------------------------------------------------
class CustomerPayload(BaseModel):
    full_name: str
    phone: str
    address: str


class OrderItemPayload(BaseModel):
    id: Union[str, int]
    name: str
    volume: Optional[str] = None
    price: float
    quantity: int = 1


class OrderCreate(BaseModel):
    # Nested payload from React Storefront
    customer: Optional[CustomerPayload] = None
    items: Optional[List[OrderItemPayload]] = None
    total: Optional[float] = None
    currency: Optional[str] = "PKR"
    payment_method: Optional[str] = "COD"

    # Flat payload alternative
    customer_name: Optional[str] = None
    phone_number: Optional[str] = None
    shipping_address: Optional[str] = None
    total_amount: Optional[float] = None
    items_json: Optional[Union[str, List[Any], dict]] = None

    class Config:
        example = {
            "customer": {
                "full_name": "Hamza Khan",
                "phone": "03001234567",
                "address": "Gulberg III, Lahore, Pakistan"
            },
            "items": [
                {
                    "id": "amber-oud",
                    "name": "Amber Oud",
                    "volume": "100ml",
                    "price": 8500,
                    "quantity": 1
                }
            ],
            "total": 8500,
            "currency": "PKR",
            "payment_method": "COD"
        }


class OrderOut(BaseModel):
    id: int
    customer_name: str
    phone_number: str
    shipping_address: str
    total_amount: float
    items_json: str
    payment_method: str
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
