# Time Table

This app now has two parts:

- `React + Vite` frontend for collecting teachers, classes, subjects, days, and periods
- `FastAPI + Google OR-Tools` backend for generating the timetable

## How it works

1. Add teachers.
2. Configure the school week in Validation.
3. Assign each teacher a subject, class, and `lessons per week`.
4. Generate the timetable through the OR-Tools solver.

The solver treats each `subject + class + lessons per week` entry as weekly demand, blocks teacher and class clashes, and tries to spread lessons across the week.

## Local setup

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
python -m pip install -r backend/requirements.txt
```

Start the backend:

```bash
npm run dev:backend
```

Start the frontend in a second terminal:

```bash
npm run dev
```

The Vite dev server proxies `/api/*` requests to `http://127.0.0.1:8000`.

## Scripts

- `npm run dev` starts the frontend
- `npm run dev:backend` starts the FastAPI backend with reload
- `npm run start:backend` starts the FastAPI backend without reload
- `npm run build` builds the frontend

## Railway

Railway is a good fit for this project.

You have two solid deployment options:

1. `Two services in one Railway project`
   - Frontend service: build the Vite app
   - Backend service: run `python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   - Set `VITE_API_BASE_URL` on the frontend service to your Railway backend URL

2. `Single backend service serving the built frontend`
   - This keeps the frontend and API on the same domain
   - It works well with the app's relative `/api/*` pattern, but would need a small static-file serving layer in FastAPI

For the current codebase, the fastest Railway path is usually `two services`, because the frontend already supports `VITE_API_BASE_URL`.

## Current assumptions

- School days default to Monday-Friday, but you can disable any day in the Validation step.
- Only periods marked `teaching` are used by the solver.
- Each class gets at most one lesson in a slot.
- Each teacher gets at most one lesson in a slot.
- The solver prefers to spread lessons across the week instead of stacking the same subject on one day.
