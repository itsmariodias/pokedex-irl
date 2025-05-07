from typing import Annotated

from fastapi import Depends
from sqlalchemy import Engine
from sqlmodel import SQLModel, Session, create_engine

from pokedex.config import Settings, get_settings


def create_db_engine(settings: Settings) -> Engine:
    """
    Returns the SQLAlchemy engine for database operations.
    """
    connect_args = {"check_same_thread": False}
    return create_engine(settings.database_url, echo=True, connect_args=connect_args)


engine = create_db_engine(get_settings())


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


async def get_session():
    """
    Returns a new SQLAlchemy session for database operations.
    """
    with Session(engine) as session:
        yield session


DbSession = Annotated[Session, Depends(get_session)]
