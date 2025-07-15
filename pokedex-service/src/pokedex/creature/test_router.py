from fastapi import HTTPException
import pytest

from pokedex.creature.models import Creature
from pokedex.creature.enums import BodyShapeIcon


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


def test_get_creature_success(mocker, test_client, mock_creature):
    """Test the get_creature endpoint with a valid creature ID."""
    mock_get = mocker.patch("pokedex.creature.router.get")
    mock_get.return_value = mock_creature

    response = test_client.get("/api/v1/creature/1")

    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "name": "African Lion",
        "scientific_name": "Panthera leo",
        "description": "A large wild cat species found in Africa and India.",
        "type": "Normal",
        "gender_ratio": 0.5,
        "kingdom": "Animalia",
        "classification": "Mammal",
        "family": "Felidae",
        "height": 1.2,
        "weight": 190.0,
        "body_shape": BodyShapeIcon.QUADRUPED.value,
        "image_path": "path/to/image.jpg",
    }


def test_get_creature_not_found(mocker, test_client):
    """Test the get_creature endpoint with a non-existent creature ID."""
    mock_get = mocker.patch("pokedex.creature.router.get")
    mock_get.return_value = None

    response = test_client.get("/api/v1/creature/999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Creature not found"}


def test_get_creature_error(mocker, test_client):
    """Test the get_creature endpoint when an error occurs."""
    mock_get = mocker.patch("pokedex.creature.router.get")
    mock_get.side_effect = HTTPException(
        status_code=500, detail="Internal Server Error"
    )

    response = test_client.get("/api/v1/creature/1")

    assert response.status_code == 500
    assert response.json() == {"detail": "Internal Server Error"}


def test_get_all_creatures(mocker, test_client, mock_creature):
    """Test the get_all_creatures endpoint with multiple creatures."""
    mock_get_all = mocker.patch("pokedex.creature.router.get_all")
    mock_creature_2 = mock_creature.model_copy()
    mock_creature_2.id = 2
    mock_creature_2.name = "African Elephant"
    mock_get_all.return_value = [mock_creature, mock_creature_2]

    response = test_client.get("/api/v1/creature/")

    assert response.status_code == 200
    assert len(response.json()) == 2
    assert response.json()[0]["id"] == 1
    assert response.json()[0]["name"] == "African Lion"
    assert response.json()[1]["id"] == 2
    assert response.json()[1]["name"] == "African Elephant"


def test_get_all_creatures_empty(mocker, test_client):
    """Test the get_all_creatures endpoint with no creatures."""
    mock_get_all = mocker.patch("pokedex.creature.router.get_all")
    mock_get_all.return_value = []

    response = test_client.get("/api/v1/creature/")

    assert response.status_code == 200
    assert response.json() == []


def test_get_all_creatures_error(mocker, test_client):
    """Test the get_all_creatures endpoint when an error occurs."""
    mock_get_all = mocker.patch("pokedex.creature.router.get_all")
    mock_get_all.side_effect = HTTPException(
        status_code=500, detail="Internal Server Error"
    )

    response = test_client.get("/api/v1/creature/")

    assert response.status_code == 500
    assert response.json() == {"detail": "Internal Server Error"}


def test_identify_creature(mocker, test_client, mock_creature):
    """Test the identify_creature endpoint with a valid image."""
    mock_identify = mocker.patch("pokedex.creature.router.identify_from_image")
    mock_identify.return_value = mock_creature

    response = test_client.post(
        "/api/v1/creature/identify",
        files={"image": ("invalid_image.png", b"image_data")},
    )

    assert response.status_code == 200
    assert response.json() == {
        **mock_creature.model_dump(),
        "body_shape": mock_creature.body_shape.value,
    }


def test_identify_creature_invalid_image(mocker, test_client):
    """Test the identify_creature endpoint with an invalid image."""
    mock_identify = mocker.patch("pokedex.creature.router.identify_from_image")
    mock_identify.side_effect = Exception("Invalid image")

    response = test_client.post(
        "/api/v1/creature/identify",
        files={"image": ("invalid_image.txt", b"not an image")},
    )

    assert response.status_code == 422
    assert response.json() == {
        "detail": "File must be an image. Received content-type: text/plain"
    }


def test_identify_creature_error(mocker, test_client):
    """Test the identify_creature endpoint when an error occurs."""
    mock_identify = mocker.patch("pokedex.creature.router.identify_from_image")
    mock_identify.side_effect = HTTPException(
        status_code=500, detail="Internal Server Error"
    )

    response = test_client.post(
        "/api/v1/creature/identify",
        files={"image": ("invalid_image.png", b"image_data")},
    )

    assert response.status_code == 500
    assert response.json() == {"detail": "Internal Server Error"}
