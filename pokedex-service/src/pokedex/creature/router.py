from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, UploadFile

from pokedex.config import Settings, get_settings
from pokedex.database import DbSession

from .dependencies import validate_image
from .models import CreaturePublic
from .service import identify_from_image, get, get_all

router = APIRouter(prefix="/creature", tags=["creature-identification"])


@router.get(
    "/{creature_id}",
    response_model=CreaturePublic,
    responses={
        404: {
            "description": "Creature not found",
            "content": {
                "application/json": {"example": {"detail": "Creature not found"}}
            },
        }
    },
)
async def get_creature(
    db_session: DbSession,
    creature_id: int,
):
    """
    Endpoint to get a creature by its ID.

    Args:
        db_session: Database session
        creature_id: The ID of the creature to retrieve

    Returns:
        Details of the requested creature
    """

    creature = get(db_session, creature_id)
    if not creature:
        raise HTTPException(
            status_code=404,
            detail="Creature not found",
        )
    return creature


@router.get(
    "/",
    response_model=list[CreaturePublic],
)
async def get_all_creatures(
    db_session: DbSession,
):
    """
    Endpoint to get all creatures.

    Args:
        db_session: Database session

    Returns:
        List of creatures
    """

    creatures = get_all(db_session)
    return creatures


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

    creature = await identify_from_image(db_session, image, settings.upload_dir)
    return creature
