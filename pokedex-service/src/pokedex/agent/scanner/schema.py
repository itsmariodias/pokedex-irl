from pydantic import BaseModel
from pydantic import Field


class ScannerState(BaseModel):
    image: bytes
    creature_name: str | None = None

class CreatureName(BaseModel):
    name: str = Field(
        description="The name of the creature identified from the image."
    )

class IsCreatureState(BaseModel):
    is_creature: bool = Field(
        description="Indicates if the identified object is an animal/sea creature or not."
    )
