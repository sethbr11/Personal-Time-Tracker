# Personal Time Tracker Backend

The Node.js and Express API server that manages business logic, logs errors, and handles sheet reads/writes.

## Tech Stack

- **Server Framework:** Express.js
- **Database Layer:** Google Sheets API via `google-spreadsheet`
- **Authentication:** Google JWT Service Account authentication
- **Request Logging:** Morgan middleware

## Scripts

From this directory, you can run:

### `npm start`

Starts the Express API server on `http://localhost:3001` (or whichever port is defined in `PORT` env variable).

### API Endpoints

- `GET /api/data`: Returns array of history entries.
- `POST /api/clock-in`: Adds a new start timer entry.
- `POST /api/clock-out`: Completes the current active timer session.
- `POST /api/manual-entry`: Adds a past entry (safely inserting it before any active timer).
- `POST /api/legacy-hours`: Adds legacy bulk hours entries.
- `POST /api/logs`: Receives frontend client errors and logs them to console.
