import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import settings

logger = logging.getLogger("algoforge.database")

Base = declarative_base()

active_engine = None
AsyncSessionLocal = None

async def init_engine():
    global active_engine, AsyncSessionLocal
    try:
        # Try primary PostgreSQL connection
        logger.info(f"Connecting to database: {settings.DATABASE_URL}")
        engine = create_async_engine(
            settings.DATABASE_URL,
            echo=False,
            future=True,
            pool_size=15,
            max_overflow=25
        )
        # Test connection
        from sqlalchemy import text
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        active_engine = engine
        logger.info("Successfully connected to primary PostgreSQL database.")
    except Exception as e:
        logger.warning(f"PostgreSQL connection failed ({e}). Falling back to SQLite: {settings.SQLITE_FALLBACK_URL}")
        active_engine = create_async_engine(
            settings.SQLITE_FALLBACK_URL,
            echo=False,
            future=True
        )
    
    AsyncSessionLocal = async_sessionmaker(
        bind=active_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False
    )
    return active_engine

async def get_db():
    if AsyncSessionLocal is None:
        await init_engine()
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
