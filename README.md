# Faculty Consultation Booking System

A centralized web-based scheduling platform that optimizes academic consultation management by enabling structured appointment booking, real-time availability tracking, and automated attendance verification.

## Project Contributors

- Cris Ivan M. Nual: System Architecture, Database Schema, Authentication, Session Management
- Jasmine T. Baldoza: Faculty Directory, Client-side Search, Instructor Booking Profiles
- April D. Peñones: Consultation Records Ledger, Printable Attendance Slips, Slot Conflict Safeguards
- Kyle Daniel F. Martirez: Analytics Dashboard, Schedule Matrix View, In-App Notifications, Office Hours Management

## Assigned System 

Faculty Consultation Booking System

## Technology Stack

- Runtime Environment: Node.js
- Web Framework: Express.js
- Database: MySQL 8.x with connection pooling (mysql2)
- Template Engine: EJS (Embedded JavaScript)
- User Interface: Bootstrap 5.3 and Bootstrap Icons
- Security: bcryptjs password hashing and express-session state management
- Version Control: Git and GitHub Projects

## System Features

Student Portal:
- Account Registration: Student self-registration with institutional ID validation.
- Faculty Directory: Real-time search by name, department, or office room.
- Schedule Calendar: Interactive monthly calendar displaying instructor availability.
- Conflict Prevention: Automatic verification preventing duplicate or overlapping bookings.
- Records Ledger: Centralized list of appointments with real-time status tracking.
- Printable Verification Slips: Standardized printable slips with student and faculty signature sections.
- Session Feedback: Post-consultation rating and review system for completed appointments.
- Cancellation Control: Ability to cancel appointments and reopen reserved time slots.

Faculty Portal:
- Office Hours Configuration: Management interface to add, edit, or remove weekly availability windows.
- Profile Management: Controls for updating office location, consultation mode, and meeting links.
- Dashboard Metrics: KPI counters tracking total, pending, confirmed, and completed sessions.
- Status Management: Controls to confirm, complete, or reject consultation requests with notes.
- Evaluation Visibility: Access to student ratings and feedback on completed sessions.
- Queue Management: Capability to remove old or cancelled consultation records.

Global Features:
- In-App Notification Center: Bell counter and dropdown alerting users to bookings, status updates, and cancellations.
- Weekly Schedule Matrix: Overview of faculty duty hours across Monday through Saturday.

## Installation and Setup

Prerequisites:
- Node.js (version 18 or later)
- XAMPP (Apache and MySQL services running)

1. Database Setup
Open phpMyAdmin (http://localhost/phpmyadmin), then create a database named faculty_consultation_db or import database/schema.sql.

2. Environment Setup
Configure your .env file in the project root:
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=faculty_consultation_db
SESSION_SECRET=faculty_consultation_secret_2026

3. Execution
Run the following commands in PowerShell:
npm install
node app.js

The system will run at http://localhost:3000.

## Demo Accounts

Password for all accounts: password123

- Student: ivan_nual
- Faculty: engr_reyes

New accounts can also be created directly via the registration page (/register).

## Project Structure

- app.js: Express setup, sessions, and routes
- config/: database connection
- controllers/: request handling and business logic
- middleware/: login and role checks
- models/: database queries
- routes/: route definitions
- views/: EJS pages
- database/: schema.sql and seed.js

## Known Limitations

- Booking time slots are fixed periods and do not follow each instructor's configured office hours.
- The booking calendar shows only the current month.
- Booking does not yet validate the date format or reject past dates.
- The status-update and review endpoints do not yet check role or ownership.
- There are no automated tests yet.

## Academic Disclosure

Generative AI was utilized during development for code boilerplate scaffolding, SQL schema validation, script formatting, and documentation assistance. All system logic, integration workflows, and database interactions were manually implemented, tested, and validated.

## License

This project is licensed under the MIT License.
