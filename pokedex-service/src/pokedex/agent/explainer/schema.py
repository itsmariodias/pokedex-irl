from pydantic import BaseModel, Field

from pokedex.creature.enums import BodyShapeIcon


class CreatureExplanation(BaseModel):
    scientific_name: str = Field(
        description="The scientific name of the creature, e.g., 'Panthera leo'."
    )
    description: str = Field(
        description="A brief description of the creature, including its habitat, behavior, and notable features."
    )
    type: str = Field(
        description="The type of the creature if it were a Pokémon, e.g., 'Fire', 'Water', 'Grass'."
    )
    gender_ratio: float = Field(
        "The ratio of males to females in the species, e.g., 0.5 for a 1:1 ratio."
    )
    kingdom: str = Field(
        description="The biological kingdom to which the creature belongs, e.g., 'Animalia'."
    )
    classification: str = Field(
        description="The classification to which the creature belongs, such as 'Mammal', 'Bird', etc."
    )
    family: str = Field(
        description="The family to which the creature belongs, e.g., 'Felidae' for cats."
    )
    height: float = Field(
        description="The average height of the creature in centimeters, e.g., 150 for 150 centimeters."
    )
    weight: float = Field(
        description="The average weight of the creature in kilograms, e.g., 85 for 85 kilograms."
    )
    body_shape: BodyShapeIcon = Field(
        description="The body shape of the creature, represented by an icon enum."
    )


class ExplainerState(BaseModel):
    creature_name: str
    creature: CreatureExplanation | None = None
