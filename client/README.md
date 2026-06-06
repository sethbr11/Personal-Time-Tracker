# Personal Time Tracker Frontend

The user interface for the Time Tracker application. It is built as a single-page React application powered by Vite.

## Tech Stack

- **Framework:** React 19
- **Bundler/Dev Server:** Vite 6
- **Routing:** React Router v7
- **Styling:** Vanilla CSS (Glassmorphism & animations)
- **State Management:** React Context API (`TimeContext` & `ToastContext`)

## Scripts

From this directory, you can run:

### `npm start`

Starts the Vite dev server at `http://localhost:3000`. API requests to `/api/*` are automatically proxied to the backend at `http://localhost:3001` via configuration in `vite.config.js`.

### `npm run build`

Builds the production-ready React client to the `build` folder. Output files are fully compiled, optimized, and minified.

### `npm run preview`

Locally previews the generated production build.
