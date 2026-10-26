# TubeV

TubeV is a full-stack video-sharing app built with React and Express. It includes
video discovery, channel pages, subscriptions, likes, comments, uploads, and a
creator dashboard.

## Tech stack

- Frontend: React, Vite, Tailwind CSS, React Router, Recharts
- Backend: Node.js, Express, MongoDB/Mongoose
- Media: Cloudinary
- Authentication: JWT stored in HTTP-only cookies

## Run locally

1. Install frontend dependencies: `cd frontend && npm ci`
2. Copy `frontend/.env.example` to `frontend/.env` and configure the API URL.
3. Install backend dependencies: `cd Social-media-backend && npm ci`
4. Copy `Social-media-backend/.env.example` to
   `Social-media-backend/.env` and fill in MongoDB, JWT, and Cloudinary values.
5. Start the API with `npm run dev` from `Social-media-backend`.
6. Start the UI with `npm run dev` from `frontend`.

Never commit `.env` files or production credentials.

## Deploy

### API on Render

1. Create a Render Blueprint from the `Social_media_backend` repository. Its
   `render.yaml` configures the Node service and health-check endpoint.
2. Add the secret values requested by Render: MongoDB URL, JWT secrets, and
   Cloudinary credentials.
3. Set `CORS_ORIGIN` to the exact deployed frontend origin, without a trailing
   slash.
4. Confirm `https://<render-service>/api/v1/healthcheck/` returns HTTP 200.

### Frontend on Vercel

1. Import the `TubeV` repository and set the project root to `frontend`.
2. Vercel detects Vite; use `npm run build` and `dist` as the output directory.
   `vercel.json` handles client-side route fallback.
3. Add `VITE_API_BASE_URL=https://<render-service>/api/v1` to the Vercel
   project's environment variables, then redeploy.
4. Update Render's `CORS_ORIGIN` to the final Vercel domain.

Vercel and Render use different domains by default. Production auth cookies are
configured for cross-site HTTPS requests (`SameSite=None; Secure`). For the most
reliable browser cookie support, use a custom frontend domain and an API
subdomain under the same parent domain.

## CI

GitHub Actions builds the frontend and checks backend JavaScript syntax on
pushes to `main` and pull requests.
