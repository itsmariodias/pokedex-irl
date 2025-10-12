# Pokedex Service

Backend service for the Pokedex IRL project. Provides creature data storage, identification via image uploads, and an agent-driven reasoning system for explanations.

Overview
--------
- Image upload and validation
- Creature identification endpoint (image -> creature)
- CRUD operations for creature records
- SQLite storage with SQLModel/SQLAlchemy
- FastAPI REST API with Swagger/ReDoc docs
- Modular agent system (LangGraph) for scanning/explaining

Highlights / Features
---------------------
- POST `/api/v1/creature/identify` — identify a creature from an uploaded image (multipart/form-data)
- GET `/api/v1/creature` — list creatures
- CRUD endpoints for creature records
- Agent modules for advanced reasoning and explanations (LangGraph integrations)

Tech stack
----------
- Python 3.12+
- FastAPI
- SQLModel / SQLAlchemy
- SQLite
- Pydantic
- Uvicorn (ASGI server)
- LangGraph (agent framework)
- OpenAI or other LLM providers for agent reasoning

Quick start (local development)
--------------------------------
1. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # macOS / Linux
# on Windows PowerShell:
# .\venv\Scripts\Activate.ps1
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create required static directories:

```bash
mkdir -p static/uploads
```

4. Run the development server (reloads on change):

```bash
uvicorn pokedex.main:app --reload
```

### Open API docs:

- Swagger UI: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc

Configuration & environment
---------------------------
- Application configuration is in `src/pokedex/config.py`.
- If you use LLMs (OpenAI or compatible), configure credentials as environment variables per `llm.py` or your preferred secrets method.
- Example `.env` variables:

    ```env
    # Model API (for agent reasoning)
    MODEL_API_KEY="your-model-api-key"
    MODEL_NAME="gpt-5"
    MODEL_ENDPOINT="http://localhost:8081/"  # Optional, for local models

    # Image Model API (for image identification)
    IMAGE_MODEL_API_KEY="your-image-model-api-key"
    IMAGE_MODEL_NAME="gpt-5"
    IMAGE_MODEL_ENDPOINT="http://localhost:8080/"  # Optional, for local models

    # Static file directories
    STATIC_DIR="/absolute/path/to/static"
    UPLOAD_DIR="/absolute/path/to/static/uploads"
    ```

- Copy `.env.example` to `.env` and update values as needed.
- Ensure `UPLOAD_DIR` exists and is writable by the backend.
- Never commit real API keys to version control.


Project structure
-----------------
```
src/
└── pokedex/
    ├── config.py            # Application configuration
    ├── database.py          # DB engine, sessions and helpers
    ├── llm.py               # Optional LLM integration (OpenAI helper)
    ├── main.py              # FastAPI application & router mounting
    ├── agent/               # Modular agent system (LangGraph)
    │   ├── agents.py        # Agent registry and orchestration
    │   ├── explainer/       # Explainer agent implementation
    │   │   ├── agent.py
    │   │   ├── nodes.py
    │   │   └── schema.py
    │   └── scanner/         # Scanner agent implementation
    │       ├── agent.py
    │       ├── nodes.py
    │       └── schema.py
    └── creature/            # Creature identification module
        ├── dependencies.py  # FastAPI dependency helpers
        ├── enums.py         # Creature enums
        ├── models.py        # Data models (SQLModel / Pydantic)
        ├── router.py        # API routes for creature endpoints
        ├── service.py       # Business logic and identification flow
        ├── utils.py         # Utility functions
        ├── test_dependencies.py  # Tests for dependencies
        ├── test_router.py   # Tests for API routes
        ├── test_service.py  # Tests for service logic
        └── test_utils.py    # Tests for utility functions
```

Troubleshooting
---------------
- Missing images / uploads: create `static/uploads` and ensure the backend has write permission.
- DB errors: check `pokedex.db` (SQLite) and migration scripts if present.
- CORS: when used with the UI, enable CORS for the UI origin (e.g. http://localhost:5173).
- Agent/LLM failures: ensure LLM API keys are set and reachable; check logs for API errors or rate limits.

License
-------
Apache License 2.0 — see the repository `LICENSE` file for details.
