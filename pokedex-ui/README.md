# Pokedex IRL UI

Frontend for the Pokedex IRL project, providing a modern interface for scanning, identifying, and exploring real-world creatures in Pokédex style.

## Features

- Upload and scan images of creatures
- View Pokédex-style entries for identified creatures
- Interactive creature list and detail cards
- Animated scan popup and loading spinner
- Responsive design and navigation bar
- Body shape icons for visual classification

## Tech Stack

- React (TypeScript)
- Vite
- CSS Modules
- REST API integration with Pokedex Service backend

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   The app will be available at http://localhost:5173 (default Vite port).

3. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
pokedex-ui/
├── public/                # Static assets
│   └── vite.svg
├── src/                   # Source code
│   ├── App.tsx            # Main app component
│   ├── App.css            # App styles
│   ├── NavBar.tsx         # Navigation bar
│   ├── CreatureList.tsx   # List of creatures
│   ├── CreatureCard.tsx   # Creature detail card
│   ├── ScanPopup.tsx      # Scan popup/modal
│   ├── assets/            # Images and icons
│   │   ├── react.svg
│   │   ├── spinner.gif
│   │   └── body_shape_icons/
│   │       ├── bipedal.png
│   │       ├── quadruped.png
│   │       └── ...
│   ├── index.css          # Global styles
│   ├── main.tsx           # App entry point
│   └── vite-env.d.ts      # Vite environment types
├── index.html             # HTML template
├── package.json           # Project metadata and scripts
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite config
```

## License

Apache License 2.0 - See LICENSE file for details
