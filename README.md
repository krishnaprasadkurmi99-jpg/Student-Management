# Campusly Student Management System

A student directory with a responsive HTML/CSS/JavaScript frontend, a Python Flask REST API, and SQLite for local development. The same SQLAlchemy data model can use a managed PostgreSQL database when deployed.

## Project structure

```text
backend/
  app.py                 Flask app, REST API, and database models
  __init__.py
frontend/
  templates/
    index.html           HTML page
    login.html           Sign-in and first-admin setup
public/
  assets/
    styles.css           CSS styles served directly by Vercel
    app.js               Browser JavaScript
    auth.js              Sign-in and first-admin setup
pyproject.toml            Vercel Flask entrypoint
tests/
  test_app.py            Backend API tests
```

## Features

- Add, edit, view, search, filter, and delete student records.
- First-run administrator setup, secure sign-in/sign-out, hashed passwords, and CSRF-protected API writes.
- Separate overview, student, independent course, attendance, grades, fees, and reports pages.
- Create, edit, and delete courses. Enrollments must use a course in the course catalog.
- Mark attendance by date (Present, Absent, Late, or Excused), and clear or update a mark.
- Record and edit assessment grades with score validation.
- Track fee amounts, partial payments, balances, due dates, and payment status (no payment processing).
- Download student, course, attendance, grades, and fee reports as CSV.
- Dashboard totals for enrolled students, active students, graduates, and courses.
- Validated JSON API with duplicate-email, authentication, and missing-record handling.
- SQLite locally; PostgreSQL in deployment via `DATABASE_URL`.
- Importable Postman collection for API checks and CRUD examples.

## Run locally

Python 3.10 or later is recommended.

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python backend\app.py
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000). On first run, create the initial administrator account in the browser. Choose a unique email address and a password of at least 12 characters. The password is stored as a secure hash. Subsequent visits show the sign-in page.

The local SQLite database is created on the first API request. To initialize explicitly, run `flask --app backend.app init-db`. The root `app.py` remains a compatibility entry point, so `python app.py` works too. To create another administrator from the command line, run `flask --app backend.app create-admin`; the command prompts for account details and a password.

Set `SECRET_KEY` to a long, random secret in deployment so sessions remain secure across restarts. On HTTPS deployments also set `SESSION_COOKIE_SECURE=1`. Keep both values private; do not commit them.

If PowerShell script execution is restricted, activate the environment from Command Prompt with `.venv\Scripts\activate.bat`, or call `.venv\Scripts\python.exe` directly.

## REST API

Base URL: `http://127.0.0.1:5000`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/auth/status` | Check whether first-admin setup is required and obtain a CSRF token |
| `POST` | `/api/auth/setup` | Create the first administrator |
| `POST` | `/api/auth/login` | Sign in |
| `GET` | `/api/auth/me` | Get the current account and CSRF token |
| `POST` | `/api/auth/logout` | Sign out |
| `GET` | `/api/stats` | Dashboard totals |
| `GET`, `POST` | `/api/courses` | List and create courses |
| `PUT`, `DELETE` | `/api/courses/<id>` | Update or delete a course (enrolled courses cannot be deleted) |
| `GET` | `/api/students` | List students; supports `search` and `status` query parameters |
| `POST` | `/api/students` | Enroll a student in an existing course |
| `GET`, `PUT`, `DELETE` | `/api/students/<id>` | Read, update, and delete student records |
| `GET` | `/api/attendance?date=YYYY-MM-DD` | Get a daily register |
| `PUT` | `/api/attendance` | Save or clear a set of daily attendance marks |
| `GET`, `POST` | `/api/grades` | List and record assessment results |
| `PUT`, `DELETE` | `/api/grades/<id>` | Edit or delete a grade |
| `GET`, `POST` | `/api/fees` | List and create fee records |
| `PUT`, `DELETE` | `/api/fees/<id>` | Update amount paid or delete a fee record |
| `GET` | `/api/reports/{students,courses,attendance,grades,fees}.csv` | Download CSV reports |

All `/api` endpoints except health, auth status, first-admin setup, and sign-in require a signed-in administrator. Send the session cookie and `X-CSRF-Token` header with every `POST`, `PUT`, and `DELETE`. Fetch the token from `/api/auth/status` before setup or from `/api/auth/me` after sign-in.

Student creation requires `first_name`, `last_name`, `email`, `course` (an existing course name), `enrollment_date` (`YYYY-MM-DD`), and `status` (`Active`, `Graduated`, or `On leave`). `phone`, `date_of_birth`, and `address` are optional. Grades use a non-negative score that cannot exceed the maximum. Fee payments are manually recorded; paid amounts cannot exceed the fee total. Validation errors use status `400`, duplicate records use `409`, and missing records use `404`.

## Postman

In Postman, choose **Import** and select `postman/Student-Management-API.postman_collection.json`. Set the collection's `baseUrl`, `adminName`, `adminEmail`, and `adminPassword` variables. Run **Auth status**, then **First-time administrator setup** (first run) or **Sign in** (later runs). Postman keeps the session cookie and CSRF token for subsequent API requests. Create a course before creating students.

## Deploy to Vercel

Import the repository into Vercel with the repository root as the project root. `pyproject.toml` points Vercel's Python runtime to `backend.app:app`; dependencies come from `requirements.txt`, and frontend files in `public/assets/` are served by Vercel's static CDN.

In Vercel **Project Settings → Environment Variables**, set:

- `SECRET_KEY`: a long, random, stable secret; do not generate a new value per deployment.
- `DATABASE_URL`: a managed PostgreSQL connection URL. Vercel's function filesystem (including `/tmp`) is temporary, so the SQLite fallback is only for local development and is not persistent across deployments or function instances.
- `SESSION_COOKIE_SECURE=1` for the HTTPS deployment.

The app creates database tables on the first API request rather than while Vercel imports the function. This avoids connecting to the database during the build/import phase. The app accepts `postgresql://` and older `postgres://` URLs and connects using Psycopg 3. Never commit production credentials.

For other hosts, the repository includes a `Procfile`; configure the service to install `requirements.txt` and start with `gunicorn backend.app:app`.

## Tests

```powershell
python -m pip install -r requirements.txt
python -m pytest
```
