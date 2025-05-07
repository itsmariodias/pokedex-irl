from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from pokedex.config import Settings, get_settings
from pokedex.creature.models import CreatureCreate, CreaturePublic
from pokedex.creature.service import create_creature
from pokedex.creature.utils import upload_file
from pokedex.database import DbSession
from pokedex.creature.dependencies import validate_image
from typing import Annotated

router = APIRouter(prefix="/creature", tags=["creature-identification"])


@router.post(
    "/identify",
    response_model=CreaturePublic,
    responses={
        400: {
            "description": "Bad Request",
            "content": {
                "application/json": {"example": {"detail": "File must be an image"}}
            },
        }
    },
)
async def identify_creature(
    db_session: DbSession,
    settings: Annotated[Settings, Depends(get_settings)],
    image: Annotated[UploadFile, Depends(validate_image)],
):
    """
    Endpoint to identify a creature from an uploaded image.

    Args:
        db_session: Database session
        settings: Application settings
        image: The validated image file

    Returns:
        Details of the identified creature
    """
    # Save the file to the static directory
    file_path = await upload_file(image, settings.upload_dir)

    # Create a new Creature object
    creature = CreatureCreate(
        name="Red Kangaroo",
        scientific_name="Macropus rufus",
        description="The red kangaroo is the largest of all kangaroos and is native to Australia.",
        type="Normal/Fighting",
        gender_ratio=0.5,
        kingdom="Animalia",
        classification="Mammal",
        family="Macropodidae",
        height=1.5,
        weight=85.0,
        shape="Quadruped",
        image_path=file_path,
    )

    return create_creature(db_session, creature)
