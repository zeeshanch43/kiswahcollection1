import os
import uuid
from pathlib import Path

from .database import supabase_client

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
IMAGES_DIR = STATIC_DIR / "images"

STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "product-images")

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/gif": ".gif",
}


def upload_product_image(data: bytes, content_type: str, prefix: str = "products") -> str:
    """Upload an image to Supabase Storage and return its public URL.

    Falls back to the local static/images folder when the Supabase client is
    not configured, so the API keeps working in local development.
    """
    ext = ALLOWED_TYPES.get(content_type, ".jpg")
    filename = f"{uuid.uuid4().hex}{ext}"

    if supabase_client is None:
        IMAGES_DIR.mkdir(parents=True, exist_ok=True)
        target = IMAGES_DIR / filename
        target.write_bytes(data)
        print(f"[*] NOTICE: Supabase not configured — image saved locally at {target}")
        return f"/static/images/{filename}"

    path = f"{prefix}/{filename}"
    try:
        supabase_client.storage.from_(STORAGE_BUCKET).upload(
            path,
            data,
            file_options={"content-type": content_type, "upsert": "true"},
        )
    except Exception as exc:
        raise RuntimeError(
            f"Supabase Storage upload failed ({exc}). "
            f"Make sure the public bucket '{STORAGE_BUCKET}' exists — "
            "run the Storage section of supabase_schema.sql in the Supabase SQL Editor, "
            "and that SUPABASE_URL / SUPABASE_KEY are set in backend/.env"
        ) from exc

    return supabase_client.storage.from_(STORAGE_BUCKET).get_public_url(path)


def delete_product_image(image_url: str) -> None:
    """Best-effort removal of an object from the Supabase bucket."""
    if supabase_client is None or not image_url:
        return
    marker = f"/object/public/{STORAGE_BUCKET}/"
    if marker not in image_url:
        return
    try:
        object_path = image_url.split(marker, 1)[1].split("?", 1)[0]
        supabase_client.storage.from_(STORAGE_BUCKET).remove([object_path])
    except Exception as e:
        print(f"[!] Warning: Could not delete storage object {image_url}: {e}")
