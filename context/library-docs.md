# Vidora Library and Integration Notes

## React, Vite, and Router

- React 19 renders from `frontend/src/main.jsx`.
- Vite serves and builds the frontend.
- React Router v6 defines routes in `frontend/src/App.jsx`.
- Keep route components compatible with the existing provider hierarchy and `PageLayout`.

## Axios

Use the shared instance from `frontend/src/services/api.js`. It provides the API base URL, timeout, bearer-token request injection, and unauthorized redirect behavior. Add endpoint methods in `services/endpoints.js`; do not create parallel clients.

## Framer Motion

Use for focused transitions and loading/entrance states. Reuse existing motion patterns, avoid excessive animation, and support reduced motion.

## Tailwind CSS

Tailwind v4 is enabled through the Vite plugin. Design tokens live in `frontend/src/styles/globals.css`. Use semantic utilities generated from those tokens and preserve the `[data-theme]` light-theme override.

## Express

Backend routes are mounted from `backend/src/app.js`. Add a route module and controller only when the feature needs a new API capability. Existing controllers use `asyncHandler`, `ApiError`, and `ApiResponse`.

## MongoDB and Mongoose

Models in `backend/src/models/` define persisted entities. Use existing references and timestamps. For new fields or models, document ownership, indexes, migration/backfill needs, and API impact in the feature prompt before implementation.

## JWT Authentication

The frontend stores the access token in `localStorage` under `token`; the Axios interceptor sends it as a bearer token. Backend `VerifyJWT` populates the authenticated request user. Preserve this flow unless a security-focused feature explicitly replaces it.

## Multer and Cloudinary

Multipart uploads enter through Multer middleware and are handled in user/video controllers. Cloudinary helper functions own upload and deletion behavior. Preserve field names and clean up temporary files when the existing flow requires it.

## Environment

Frontend variables use `VITE_` names. Backend variables are loaded from `backend/.env`; use `.env.example` as the shareable contract. Never commit credentials or copy real secret values into context files.

## Validation

Minimum validation for a code change:

```text
cd frontend && npm run lint
cd frontend && npm run build
```

Run backend checks available in the current package scripts and manually exercise affected API flows when automated tests are absent.
