import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from pokedex.main import app
from pokedex.config import get_settings


@pytest.fixture
def test_client():
    """Fixture to create a FastAPI test client."""
    return TestClient(app)


@pytest.fixture
def mock_settings():
    """Fixture to provide application configuration."""
    settings = get_settings()
    return settings


@pytest.fixture
def mock_db_session(mocker):
    session = mocker.Mock(spec=Session)
    session.commit = mocker.Mock()
    session.refresh = mocker.Mock()
    session.add = mocker.Mock()
    session.query = mocker.Mock()
    session.get = mocker.Mock()
    return session
