# Admission Management System

The Admission Management System is a monorepo application for managing academic programs, applicants, seat allocation, and admission confirmation in one place. It is designed to be beginner-friendly while still following clean, production-ready patterns such as modular routing, service layers, and reusable frontend utilities.

## Project Overview

This project includes:

- `client/`: React frontend for dashboards and admission workflow screens
- `server/`: Node.js and Express backend with MongoDB and Mongoose
- Root-level monorepo scripts powered by `concurrently`

## Tech Stack

- React 18
- Vite
- React Router
- Axios
- TanStack Query
- React Toastify
- Yup
- Node.js
- Express
- MongoDB
- Mongoose
- Nodemon

## Prerequisites

Before running the project, make sure you have:

- Node.js installed
- npm installed
- MongoDB Atlas connection string

## Setup Instructions

### 1. Install root dependencies

```bash
npm install
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

```bash
cd ../server
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `server/` folder with the following values:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
```

Create a `.env` file inside the `client/` folder with the following value:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 5. Start the application

From the repository root, run:

```bash
npm run dev
```

The application will run on:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Recommended Usage Flow

Follow this order while testing the project:

1. Create academic programs with seat quotas.
2. Add applicant details.
3. Allocate a seat to an applicant based on the selected quota.
4. Mark the applicant fee status as paid.
5. Confirm the admission.
6. Review the updated seat counts and admission records.

## Seat Allocation Logic

- Each program stores `quotas` and `filledSeats` for `KCET`, `COMEDK`, and `MANAGEMENT`.
- During seat allocation, the backend checks whether the selected quota has reached its limit.
- If `filledSeats[quota] >= quotas[quota]`, the request fails with `Quota Full`.
- If seats are available, the backend increments `filledSeats` immediately and creates an allocated admission record.
- Admission confirmation is allowed only when the applicant fee status is `Paid`.
- Admission numbers are generated only once and reused on repeated confirmation attempts.
- Updated seat counts are returned through the same program API so the UI can display the latest availability.

## API Endpoints

- `POST /programs`
- `GET /programs`
- `POST /applicants`
- `GET /applicants`
- `GET /admissions`
- `POST /admissions/allocate/:applicantId`
- `POST /admissions/confirm/:applicantId`

## Folder Structure

```text
admission-management-system/
  client/
    src/
      api/
      components/
        common/
        forms/
        dashboard/
      pages/
      utils/
  server/
    src/
      config/
      models/
      controllers/
      routes/
      services/
      utils/
      middleware/
      app.js
      server.js
  README.md
```

## Assignment Submission Flow

Use the following flow to submit the assignment clearly and professionally:

1. Push the completed code to a GitHub repository.
2. Make sure the `README.md` includes:
   - Project overview
   - Tech stack
   - Setup instructions
   - Environment variables
   - How to run the project
   - API endpoints
   - Application workflow
3. Verify that the project runs locally without errors.
4. Add sample screenshots or a short demo video if required by the assignment.
5. Share the GitHub repository link as your final submission.

## AI Usage

AI assistance was used to speed up scaffolding, boilerplate generation, and documentation drafting. The final structure and business logic were reviewed to keep the project readable and maintainable.
