# Admission Management System

Admission Management System is a monorepo starter for managing academic programs, applicants, seat allocation, and admission confirmation in one place. It is structured to stay beginner-friendly while following production-ready patterns such as service layers, modular routing, and reusable frontend utilities.

## Project Overview

The application includes:

- `client/`: React frontend for dashboard and admission workflow views
- `server/`: Node.js and Express backend with MongoDB and Mongoose
- Root-level monorepo scripts powered by `concurrently`

## Tech Stack

- React 18
- Vite
- React Router
- Axios
- TanStack Query (`useQuery`)
- React Toastify
- Yup
- Node.js
- Express
- MongoDB
- Mongoose
- Nodemon

## Setup Instructions

1. Install root dependencies:

```bash
npm install
```

2. Install frontend dependencies:

```bash
cd client
npm install
```

3. Install backend dependencies:

```bash
cd server
npm install
```

4. Create the backend environment file:

```bash
cd server
copy .env.example .env
```

5. Start the app from the repository root:

```bash
npm run dev
```

Frontend runs at `http://localhost:5173` and backend runs at `http://localhost:5000`.

## Deployment

This project is prepared for a single Vercel deployment with:

- `client/` built as the frontend
- `api/index.js` serving the Express backend as a Vercel serverless function
- frontend API requests using `/api` in production

### Required Vercel Environment Variable

Add this in your Vercel project settings before deploying:

```bash
MONGODB_URI=your_mongodb_connection_string
```

Do not commit backend secrets into git. Keep the MongoDB URI only in:

- local `server/.env` for development
- Vercel Environment Variables for production

### Deploy Steps

1. Open the project folder in terminal.
2. Run `vercel` to link the project if it is not linked yet.
3. Run `vercel deploy` for a preview deployment or `vercel --prod` for production.

### Production Notes

- Local development uses `http://localhost:5000/api`.
- Production uses `/api`.
- Client-side routes such as `/dashboard`, `/programs`, `/applicants`, and `/admissions` are handled by Vercel rewrites.

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

## Seat Allocation Logic

- Each program keeps `quotas` and `filledSeats` for `KCET`, `COMEDK`, and `MANAGEMENT`.
- During seat allocation, the backend checks whether the selected quota has reached its capacity.
- If `filledSeats[quota] >= quotas[quota]`, the request fails with `Quota Full`.
- If seats are available, the backend increments `filledSeats` immediately and creates an allocated admission record.
- Admission confirmation is allowed only when the applicant fee status is `Paid`.
- Admission numbers are generated only once and reused on repeated confirmation attempts.
- Updated seat counts are returned through the same program API so the UI can reflect the latest availability.

## API Endpoints

- `POST /programs`
- `GET /programs`
- `POST /applicants`
- `GET /applicants`
- `GET /admissions`
- `POST /admissions/allocate/:applicantId`
- `POST /admissions/confirm/:applicantId`

## AI Usage

AI assistance was used to speed up scaffolding, boilerplate generation, and documentation drafting. The resulting structure and business rules are designed to remain readable and maintainable for developers extending the system.
