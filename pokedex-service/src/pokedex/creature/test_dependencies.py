from fastapi import UploadFile, HTTPException
import pytest

from pokedex.creature.dependencies import validate_image


@pytest.fixture
def mock_valid_image():
    return UploadFile(
        filename="test.jpg",
        file=b"test_image_data",
        headers={"content-type": "image/jpg"},
    )


@pytest.fixture
def mock_invalid_file():
    return UploadFile(
        filename="test.txt",
        file=b"not_an_image",
        headers={"content-type": "text/plain"},
    )


@pytest.mark.asyncio
async def test_validate_image_success(mock_valid_image):
    """Test validate_image with a valid image file."""
    result = await validate_image(mock_valid_image)
    assert result == mock_valid_image
    assert result.content_type.startswith("image/")


@pytest.mark.asyncio
async def test_validate_image_invalid_file(mock_invalid_file):
    """Test validate_image with an invalid file type."""
    with pytest.raises(HTTPException) as exc_info:
        await validate_image(mock_invalid_file)

    assert exc_info.value.status_code == 422
    assert (
        exc_info.value.detail
        == "File must be an image. Received content-type: text/plain"
    )


@pytest.mark.asyncio
async def test_validate_image_different_image_types():
    """Test validate_image with different valid image types."""
    image_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]

    for image_type in image_types:
        mock_image = UploadFile(
            filename=f"test.{image_type.split('/')[-1]}",
            file=b"test_image_data",
            headers={"content-type": image_type},
        )
        result = await validate_image(mock_image)
        assert result == mock_image
