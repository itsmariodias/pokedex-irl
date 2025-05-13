from contextlib import asynccontextmanager

from fastapi import FastAPI
from loguru import logger

from pokedex.config import get_settings
from pokedex.database import create_db_and_tables
from pokedex.creature.router import router as creature_router

settings = get_settings()

logger.info("Starting Pokedex Service...")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup events
    from pokedex.database import engine

    logger.info("Creating database and tables...")
    create_db_and_tables(engine)
    yield
    # Shutdown events
    logger.info("Shutting down Pokedex Service...")


app = FastAPI(
    title=settings.project_name,
    description=settings.project_description,
    root_path=settings.api_v1_prefix,
    openapi_url="/docs/openapi.json",
    docs_url="/docs",
    redoc_url=None,
    lifespan=lifespan,
)

app.include_router(creature_router)
