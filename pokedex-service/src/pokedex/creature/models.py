from typing import Optional

from sqlmodel import SQLModel, Field

from pokedex.creature.enums import BodyShapeIcon


class CreatureBase(SQLModel):
    """
    Base Pydantic model with shared attributes
    """

    name: str = Field(unique=True, index=True)
    scientific_name: str
    description: str
    gender_ratio: float
    kingdom: str
    classification: str
    family: str
    height: float
    weight: float
    body_shape: BodyShapeIcon
    image_path: str


class Creature(CreatureBase, table=True):
    """
    SQLModel for database operations
    """

    id: Optional[int] = Field(default=None, primary_key=True)


class CreatureCreate(CreatureBase):
    """
    Schema for creating a new creature
    """

    pass


class CreaturePublic(CreatureBase):
    """
    Schema for reading creature data
    """

    id: int


class CreatureUpdate(CreatureBase):
    """
    Schema for updating a creature
    """

    name: str | None = None
    scientific_name: str | None = None
    description: str | None = None
    gender_ratio: float | None = None
    kingdom: str | None = None
    classification: str | None = None
    family: str | None = None
    height: float | None = None
    weight: float | None = None
    body_shape: BodyShapeIcon | None = None
    image_path: str | None = None
