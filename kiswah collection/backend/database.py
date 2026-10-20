import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load .env file from the backend directory
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Fallback to local SQLite if Supabase DATABASE_URL is not yet configured
if not DATABASE_URL or "your-project-ref" in DATABASE_URL:
    db_file = Path(__file__).resolve().parent / "order_logs" / "kiswah_local.db"
    DATABASE_URL = f"sqlite:///{db_file}"
    print(f"[*] NOTICE: Using local SQLite database at {db_file}. Add Supabase credentials in .env to connect to remote PostgreSQL.")

# Fix legacy 'postgres://' schema for SQLAlchemy 2.0+
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLAlchemy 2.1+ maps postgresql:// to psycopg (v3); we ship psycopg2-binary
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency that yields an active database session and ensures it closes afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Optional Supabase Python Client (for Storage / Auth if needed)
supabase_client = None
if SUPABASE_URL and SUPABASE_KEY and "your-project-ref" not in SUPABASE_URL:
    try:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"[!] Warning: Could not initialize Supabase client: {e}")
