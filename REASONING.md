# Reasoning and design notes

## 1. Goal and constraints

The clinic system needed to support real front-desk operations without letting doctors get double-booked. The spec emphasized three critical rules before cosmetic polish:

1. no overlapping appointments for the same doctor
2. fair cancellation fees for late cancellations
3. automation for reminder and no-show handling

I treated those as the root requirements and built the system around them before focusing on UI polish.

## 2. Architecture decisions

I used a full-stack structure with:

- React on the frontend for the clinic dashboard and forms
- Express on the backend for REST endpoints
- MongoDB + Mongoose for persistent schema-based storage
- JWT-based authentication for user registration/login

This keeps the system realistic and production-friendly while staying easy to run locally in development.

## 3. Booking rule design

The overlap check was the key business rule. For any appointment attempt, the backend compares the new appointment window against existing bookings for the same doctor.

If the following condition is true, the appointment is rejected:

- existing start < new end
- existing end > new start
- same doctor
- appointment is not cancelled

This prevents any doctor from being double-booked, even when bookings are entered back-to-back or across different staff sessions.

## 4. Cancellation fee logic

The cancellation policy was implemented as a time-based rule:

- free cancellation when there are at least 2 hours before the appointment start
- small fee for late cancellation

This is enforced by comparing the current time to the appointment start time and assigning a fair fee value when the appointment is cancelled.

## 5. Rescheduling logic

Rescheduling follows the same conflict check as a new booking. The system keeps the same doctor and patient but re-validates the new time range before accepting the update. This prevents hidden conflicts after a reschedule.

## 6. Notification and automation

The clock service was designed to handle the clinic’s routine operations:

- run daily reminder generation for today’s appointments
- send reminders to the outbox instead of sending messages immediately
- auto-mark appointments as no-show 30 minutes after start time if they are still active and not completed

This keeps the system deterministic and easy to test through the `/api/clock` and `/api/clock/outbox` endpoints.

## 7. Search, sorting, pagination, and landing page

To satisfy the product requirements, I included:

- search for patients and appointments
- sorting by key fields
- pagination for listing endpoints
- a landing page describing the product, audience, and next features
- registration/login flow for clinic staff

These follow the same front-desk workflow the project is meant to support.

## 8. Testing and debug process

I validated the app with real API calls instead of assuming the logic worked.

### What I checked

- health endpoint responds correctly
- appointment creation succeeds when time is valid
- overlapping bookings fail with a conflict response
- cancellation returns the correct fee behavior
- rescheduling rejects invalid overlaps
- clock automation creates reminders and marks no-shows

### Typical issues encountered

1. stale backend process on port 5000
2. conflicting Vite dev-server port usage
3. route and API mismatch between starter code and the clinic requirements
4. inconsistent appointment status naming between different parts of the app

I fixed these by restarting stale processes, confirming correct ports, aligning route names with the clinic workflow, and validating each business rule with real requests.

## 9. Outcome

The final result is a clinic scheduling product that is structured for a real workplace: secure enough for staff authentication, safe enough to prevent double-booking, and operational enough to automate routine reminders and no-show handling.
