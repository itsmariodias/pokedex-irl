from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from loguru import logger

from pokedex.config import settings
from pokedex.database import create_db_and_tables
from pokedex.creature.router import router as creature_router

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=settings.static_dir), name="static")

app.include_router(creature_router)


if __name__ == "__main__":
    import uvicorn

    logger.info("Running Pokedex Service with Uvicorn...")
    uvicorn.run(
        "pokedex.main:app",
        host="0.0.0.0",
        port=settings.port,
    )
