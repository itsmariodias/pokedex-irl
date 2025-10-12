# Pokedex IRL — UI

Lightweight React (TypeScript) UI for the Pokedex IRL project. The interface is inspired by a Pokédex: scan or upload an image of a creature, identify it via the backend, and explore the creature list and details.

Overview
--------
- Left pane: Scan area (webcam or file upload), Capture/Retake, Analyze button, spinner while identifying, and a dismissible error overlay on failure.
- Right pane: Creature list (thumbnails + quick-select) and a rectangular grid of search/filter fields including an icon-based Body Shape selector.
- Small LED in the NavBar: flashes while analysis is in progress and stays lit when an entry is selected.

Highlights / Features
---------------------
- Image capture/upload + server-side identification (POST /api/v1/creature/identify).
- Animated scan buttons and spinner; error overlay that can be dismissed and resets scan UI state.
- Creature list with thumbnail images loaded from the backend static uploads endpoint.
- Typewriter-style animated details for selected creatures (name, scientific name, description, stats).
- Icon-driven Body Shape selector (icons in `src/assets/body_shape_icons/`, loaded via Vite `import.meta.glob`).

Tech stack
----------
- React (TypeScript)
- Vite (dev server + build)
- Plain CSS / inline component styles
- Backend: Pokedex Service (FastAPI) — required for data and identification

Quick start (local development)
-------------------------------
### Prerequisites

- Node.js 18+ (or latest LTS)
- Pokedex Service backend running and reachable at http://localhost:8000 (default)

### Install and run

```bash
npm install
npm run dev
```

Open the app at http://localhost:5173 (Vite's default port).

### Build for production

```bash
npm run build
npm run preview   # optional, serves the production build locally
```

Configuration
-------------
- API base: the UI currently uses a hard-coded API URL in `src/CreatureList.tsx`:

```ts
const API_URL = 'http://localhost:8000/api/v1/creature/';
```

To change the backend location, either update that constant or refactor to use `import.meta.env.VITE_API_URL` and set it in a `.env` file for Vite.

Endpoints used
--------------
- GET `/api/v1/creature` — list creatures
- GET `/api/v1/static/uploads/<filename>` — creature images
- POST `/api/v1/creature/identify` — multipart form image upload for identification

Project structure
-----------------
```
pokedex-ui/
├─ public/                 # static html/icons
├─ src/
│  ├─ App.tsx              # top-level app
│  ├─ main.tsx             # entry
│  ├─ NavBar.tsx           # top nav + LED indicator
│  ├─ CreatureList.tsx     # main UI: scan left pane + list + filters
│  ├─ CreatureCard.tsx     # small list card (used in list)
│  ├─ CustomDropdown.tsx   # icon-based dropdown for Body Shape
│  ├─ ScanPopup.tsx        # legacy (scan is embedded in left pane)
│  ├─ assets/              # placeholder, spinner, search icon, body_shape_icons/
│  ├─ App.css              # global styles
│  └─ index.css            # global styles
├─ package.json
├─ vite.config.ts
└─ tsconfig.json
```

Troubleshooting
---------------
- Images not appearing: ensure backend serves files at `/api/v1/static/uploads/` and `image_path` entries point to existing filenames.
- CORS errors: enable CORS on the backend for the UI origin (http://localhost:5173 during dev).
- Webcam access denied: allow camera permissions in your browser; otherwise use the Upload flow.
- Identify errors: the UI shows an error overlay and stops the spinner; inspect backend logs for details and verify the identify endpoint accepts `multipart/form-data`.

License
-------
Apache License 2.0 — see the repository `LICENSE` file for details.

