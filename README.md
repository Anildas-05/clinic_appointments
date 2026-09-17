# MediPulse Clinic Appointment System

MediPulse is a full-stack clinic appointment platform for front-desk staff. It helps clinics manage doctors, patient records, appointment bookings, cancellations, reminders, and no-show tracking in one place.

## Product overview

This product is built for busy clinic front desks that need to protect doctor schedules and keep patient communication reliable. It prevents double-booking, applies fair late-cancellation rules, supports appointment rescheduling, and automates reminder/no-show handling.

### Landing page highlights

- What it is: a clinic operations dashboard for appointment scheduling and patient communication.
- Key features:
  - conflict-free booking
  - late cancellation fee logic
  - doctor-day and patient lookup views
  - reminder outbox automation
  - no-show tracking
- Target audience:
  - front desk teams
  - clinic managers
  - multi-doctor practices
- How it helps:
  - reduces scheduling mistakes
  - improves patient communication
  - saves staff time and reduces admin overhead
- Three features to build next:
  1. patient dashboard with online booking and status updates
  2. SMS/email notifications with delivery tracking
  3. analytics dashboard for doctor utilization and clinic revenue

## Tech stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB with Mongoose
- Authentication: JWT

## Features

- User registration and login
- Doctor management
- Patient management with search
- Appointment booking with overlap prevention
- Appointment cancellation with fee logic
- Rescheduling with conflict re-check
- Search, sorting, and pagination support
- Notification outbox and clock automation for reminders and no-shows

## Project structure

- client/: React front-end
- server/: Express API and business logic
- server/src/models/: MongoDB schema definitions
- server/src/controllers/: API logic
- server/src/routes/: route configuration

## Local setup

### 1) Install dependencies

From the project root:

```bash
npm install
cd client && npm install
cd ../server && npm install
```

### 2) Configure environment

Create a `.env` file in the server directory with:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/clinic_appointments
JWT_SECRET=supersecretclinicjwtkey
```

### 3) Start MongoDB

Use a local MongoDB service or Docker instance.

Example with Docker:

```bash
docker run -d -p 27017:27017 --name clinic-mongo mongo:7
```

### 4) Start the app

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

### 5) Build for production

```bash
cd client
npm run build
```

## Authentication

### Register

```http
POST /api/auth/register
```

Request body:

```json
{
  "name": "Front Desk User",
  "email": "desk@clinic.com",
  "password": "secret123",
  "role": "admin"
}
```

### Login

```http
POST /api/auth/login
```

Request body:

```json
{
  "email": "desk@clinic.com",
  "password": "secret123"
}
```

Response:

```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": "...",
    "name": "Front Desk User",
    "email": "desk@clinic.com",
    "role": "admin"
  }
}
```

## API endpoints

### Auth endpoints

- `POST /api/auth/register` — register a new user
- `POST /api/auth/login` — log in and receive a JWT

### Doctor endpoints

- `POST /api/doctors` — create a doctor
- `GET /api/doctors` — list doctors
- `PATCH /api/doctors/:id` — update doctor details

### Patient endpoints

- `POST /api/patients` — create a patient
- `GET /api/patients` — list patients with search and pagination support
- `PATCH /api/patients/:id` — update patient details

### Appointment endpoints

- `POST /api/appointments` — create a new appointment
- `GET /api/appointments` — list appointments with pagination and sorting
- `GET /api/appointments?patient=Jane` — filter appointments by patient name
- `GET /api/doctors/:id/appointments` — get a doctor’s daily schedule
- `GET /api/patients/:id/appointments` — get a patient’s appointments
- `PATCH /api/appointments/:id/cancel` — cancel an appointment and apply late cancellation fee if due
- `PATCH /api/appointments/:id/reschedule` — reschedule to a new time while preserving conflict checks

### Clock and reminders endpoints

- `POST /api/clock` — run reminder and no-show automation
- `GET /api/clock/outbox` — list notification reminders queued in the outbox

## Search, sorting, and pagination

The API supports filtering and ordering for patient and appointment listing:

- Search by patient name or phone using query strings such as `?search=smith`
- Sort by field using `?sortBy=startTime&order=asc`
- Pagination using `?page=2&limit=10`

## Business rules

- Doctors cannot have overlapping appointments.
- Late cancellations incur a small fee.
- Rescheduling re-validates overlap before saving.
- Appointments are marked as no-show 30 minutes after their scheduled start if not completed.
- Daily reminder notifications are generated via the outbox.

## Troubleshooting

### Port already in use

```bash
lsof -i :5000
kill -9 <PID>
```

### MongoDB connection issues

- verify `MONGODB_URI`
- confirm MongoDB is running locally or in Docker
- check logs for authentication and network errors

### Frontend not loading

- verify both frontend and backend are running
- check the browser DevTools network tab for API errors
- confirm Vite is serving on the expected port

## Contributors

This project was built as a full-stack clinic operations application for front-desk scheduling workflows.
