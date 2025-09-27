from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, UploadFile

from pokedex.config import Settings, get_settings
from pokedex.database import DbSession
from pokedex.creature.dependencies import validate_image
from pokedex.creature.models import CreaturePublic
from pokedex.creature.service import (
    identify_from_image,
    get,
    get_all,
    delete,
    search_creatures,
)
from pokedex.llm import get_llm

router = APIRouter(prefix="/creature", tags=["creature-identification"])


@router.get(
    "/search",
    response_model=list[CreaturePublic],
    responses={
        400: {
            "description": "Bad Request",
            "content": {
                "application/json": {"example": {"detail": "Invalid query parameters"}}
            },
        }
    },
)
async def search_creature(
    db_session: DbSession,
    id: int = None,
    name: str = None,
    scientific_name: str = None,
    kingdom: str = None,
    classification: str = None,
    family: str = None,
    body_shape: str = None,
    height_min: float = None,
    height_max: float = None,
    weight_min: float = None,
    weight_max: float = None,
    gender_ratio_min: float = None,
    gender_ratio_max: float = None,
):
    """
    Search for creatures with multiple filters.

    Args:
        db_session: Database session
        id: Filter by creature ID
        name: Filter by creature name (partial match)
        scientific_name: Filter by scientific name (partial match)
        kingdom: Filter by kingdom (exact match)
        classification: Filter by classification (exact match)
        family: Filter by family (exact match)
        body_shape: Filter by body shape (exact match)
        height_min: Minimum height filter
        height_max: Maximum height filter
        weight_min: Minimum weight filter
        weight_max: Maximum weight filter
        gender_ratio_min: Minimum gender ratio filter
        gender_ratio_max: Maximum gender ratio filter

    Returns:
        List of creatures matching the filters
    """

    creatures = await search_creatures(
        db_session=db_session,
        id=id,
        name=name,
        scientific_name=scientific_name,
        kingdom=kingdom,
        classification=classification,
        family=family,
        body_shape=body_shape,
        height_min=height_min,
        height_max=height_max,
        weight_min=weight_min,
        weight_max=weight_max,
        gender_ratio_min=gender_ratio_min,
        gender_ratio_max=gender_ratio_max,
    )
    return creatures


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


@router.delete(
    "/{creature_id}",
    responses={
        200: {
            "description": "Creature deleted successfully",
            "content": {
                "application/json": {"example": {"message": "Creature deleted"}}
            },
        },
        404: {
            "description": "Creature not found",
            "content": {
                "application/json": {"example": {"detail": "Creature not found"}}
            },
        },
    },
)
async def delete_creature(
    db_session: DbSession,
    creature_id: int,
):
    """
    Endpoint to delete a creature by its ID.

    Args:
        db_session: Database session
        creature_id: The ID of the creature to delete

    Returns:
        A message indicating the deletion status
    """
    try:
        delete(db_session, creature_id)
        return {"message": "Creature deleted"}
    except Exception:
        raise HTTPException(
            status_code=404,
            detail="Creature not found",
        )


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

    config = {
        "configurable": {
            "llm": get_llm(settings.default_model),
            "image_llm": get_llm("gemma-3-local"),
        }
    }

    creature = await identify_from_image(db_session, image, settings.upload_dir, config)
    return creature
