from unittest.mock import AsyncMock, Mock

import pytest
from fastapi import UploadFile

from pokedex.creature.models import Creature, CreatureCreate, CreatureUpdate
from pokedex.creature.enums import BodyShapeIcon
from pokedex.agent.explainer.schema import CreatureExplanation
from pokedex.creature.service import (
    create,
    get,
    get_all,
    get_all_with_pagination,
    update,
    delete,
    get_by_name,
    identify_from_image,
)


@pytest.fixture
def mock_creature():
    return Creature(
        id=1,
        name="African Lion",
        scientific_name="Panthera leo",
        description="A large wild cat species found in Africa and India.",
        type="Normal",
        gender_ratio=0.5,
        kingdom="Animalia",
        classification="Mammal",
        family="Felidae",
        height=1.2,
        weight=190.0,
        body_shape=BodyShapeIcon.QUADRUPED,
        image_path="path/to/image.jpg",
    )


@pytest.fixture
def mock_creature_create():
    return CreatureCreate(
        name="African Lion",
        scientific_name="Panthera leo",
        description="A large wild cat species found in Africa and India.",
        type="Normal",
        gender_ratio=0.5,
        kingdom="Animalia",
        classification="Mammal",
        family="Felidae",
        height=1.2,
        weight=190.0,
        body_shape=BodyShapeIcon.QUADRUPED,
        image_path="path/to/image.jpg",
    )


def test_create_success(mock_db_session, mock_creature_create, mock_creature):
    """Test creating a new creature successfully."""
    mock_db_session.commit.return_value = None
    mock_db_session.refresh.return_value = None

    result = create(mock_db_session, mock_creature_create)

    mock_db_session.add.assert_called_once()
    mock_db_session.commit.assert_called_once()
    mock_db_session.refresh.assert_called_once()
    assert isinstance(result, Creature)


def test_create_error(mock_db_session, mock_creature_create):
    """Test creating a creature with database error."""
    mock_db_session.commit.side_effect = Exception("Database error")

    with pytest.raises(Exception) as exc_info:
        create(mock_db_session, mock_creature_create)

    assert str(exc_info.value) == "Database error"
    mock_db_session.rollback.assert_called_once()


def test_get_success(mock_db_session, mock_creature):
    """Test getting a creature by ID successfully."""
    mock_db_session.get.return_value = mock_creature

    result = get(mock_db_session, 1)

    mock_db_session.get.assert_called_once_with(Creature, 1)
    assert result == mock_creature


def test_get_not_found(mock_db_session):
    """Test getting a non-existent creature."""
    mock_db_session.get.return_value = None

    result = get(mock_db_session, 999)

    assert result is None


def test_get_all(mock_db_session, mock_creature):
    """Test getting all creatures."""
    mock_db_session.query.return_value.all.return_value = [mock_creature]

    result = get_all(mock_db_session)

    assert len(result) == 1
    assert result[0] == mock_creature


def test_get_all_with_pagination(mock_db_session, mock_creature):
    """Test getting creatures with pagination."""
    mock_query = mock_db_session.query.return_value
    mock_query.offset.return_value.limit.return_value.all.return_value = [mock_creature]

    result = get_all_with_pagination(mock_db_session, skip=0, limit=10)

    mock_query.offset.assert_called_once_with(0)
    mock_query.offset.return_value.limit.assert_called_once_with(10)
    assert len(result) == 1
    assert result[0] == mock_creature


def test_update(mock_db_session, mock_creature):
    """Test updating a creature."""
    mock_db_session.get.return_value = mock_creature
    update_data = CreatureUpdate(name="Updated Lion")

    result = update(mock_db_session, 1, update_data)

    mock_db_session.commit.assert_called_once()
    mock_db_session.refresh.assert_called_once()
    assert result.name == "Updated Lion"


def test_delete(mock_db_session, mock_creature):
    """Test deleting a creature."""
    mock_db_session.get.return_value = mock_creature

    delete(mock_db_session, 1)

    mock_db_session.delete.assert_called_once_with(mock_creature)
    mock_db_session.commit.assert_called_once()


def test_get_by_name(mock_db_session, mock_creature):
    """Test getting a creature by name."""
    mock_query = mock_db_session.query.return_value
    mock_query.filter.return_value.first.return_value = mock_creature

    result = get_by_name(mock_db_session, "African Lion")

    assert result == mock_creature


@pytest.mark.asyncio
async def test_identify_from_image_existing(mocker, mock_db_session, mock_creature):
    """Test identifying an existing creature from image."""
    mock_image = Mock(spec=UploadFile)
    mock_db_session.query.return_value.filter.return_value.first.return_value = (
        mock_creature
    )

    mock_scanner_agent = Mock()
    mock_scanner_agent.ainvoke = AsyncMock(
        return_value={"image": b"fake", "creature_name": mock_creature.name}
    )

    mock_explainer_agent = Mock()
    mock_explainer_agent.ainvoke = AsyncMock()

    def agent_side_effect(name):
        if name == "scanner-agent":
            return mock_scanner_agent
        elif name == "explainer-agent":
            return mock_explainer_agent
        else:
            raise ValueError("Unknown agent")

    mocker.patch("pokedex.creature.service.get_agent", side_effect=agent_side_effect)

    result = await identify_from_image(mock_db_session, mock_image, "upload_dir", config={})

    assert result == mock_creature


@pytest.mark.asyncio
async def test_identify_from_image_new(mocker, mock_db_session):
    """Test identifying a new creature from image."""
    mock_image = Mock(spec=UploadFile)
    mock_db_session.query.return_value.filter.return_value.first.return_value = None

    mock_upload = mocker.patch(
        "pokedex.creature.service.upload_file", new_callable=AsyncMock
    )
    mock_upload.return_value = "new/image/path.jpg"

    # Mock the scanner agent to return a valid dict
    mock_scanner_agent = Mock()
    mock_scanner_agent.ainvoke = AsyncMock(
        return_value={"image": b"fake", "creature_name": "New Creature"}
    )

    # Mock the explainer agent to return a valid dict with a CreatureExplanation object
    mock_creature_explanation = CreatureExplanation(
        scientific_name="Panthera leo",
        description="A large wild cat species found in Africa and India.",
        pokemon_type="Normal",
        gender_ratio=0.5,
        kingdom="Animalia",
        classification="Mammal",
        family="Felidae",
        height=1.2,
        weight=190.0,
        body_shape=BodyShapeIcon.QUADRUPED,
    )

    mock_explainer_agent = Mock()
    mock_explainer_agent.ainvoke = AsyncMock(
        return_value={
            "creature_name": "New Creature",
            "creature": mock_creature_explanation,
        }
    )

    def agent_side_effect(name):
        if name == "scanner-agent":
            return mock_scanner_agent
        elif name == "explainer-agent":
            return mock_explainer_agent
        else:
            raise ValueError("Unknown agent")

    mocker.patch("pokedex.creature.service.get_agent", side_effect=agent_side_effect)

    result = await identify_from_image(mock_db_session, mock_image, "upload_dir", config={})

    assert isinstance(result, Creature)
    mock_db_session.add.assert_called_once()
