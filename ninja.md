# Ninja Project Context

## Project Identity

**Vidora** is a full-stack video-sharing platform inspired by YouTube. It allows guests and registered viewers to discover and watch videos, while authenticated creators can publish media, manage channels, interact with audiences, and review creator analytics.

The repository is a monorepo with two independently runnable applications:

- `frontend/` — React 19 + Vite single-page application.
- `backend/` — Express 5 REST API backed by MongoDB and Mongoose.
- `media/` — screenshots and design references.
- `context/` and `docs/` — product, architecture, workflow, UI, and implementation guidance.

## Product Capabilities

- Guest browsing and a public landing page.
- Local authentication with JWT access and refresh tokens.
- GitHub OAuth callback support.
- User profiles with avatar and cover-image uploads.
- Video upload, editing, deletion, draft/publish toggling, and view tracking.
- Cloudinary-backed video and image storage.
- Video playback with related content.
- Comments and likes for videos and comments.
- Channel pages, subscriptions, playlists, watch history, and liked videos.
- Creator dashboard with video and channel statistics.
- Search, responsive layouts, dark/light themes, loading states, empty states, error states, toast feedback, and Framer Motion transitions.

## Runtime Architecture

```text
React/Vite SPA (:5173)
        |
        | Axios JSON and multipart requests
        v
Express REST API (:8000, /api/v1)
        |
        +--> MongoDB through Mongoose
        +--> Cloudinary for video/image storage
        +--> JWT access/refresh authentication
```

The frontend starts at `frontend/src/main.jsx` and mounts `App.jsx`. `App.jsx` creates the router and provider hierarchy (`AuthProvider`, `VideoProvider`, and `UIProvider`), then composes the shared `Navbar`, `Sidebar`, error boundary, toast container, and upload progress UI. Frontend API traffic is centralized in `frontend/src/services/api.js`, which injects the access token and redirects to login after unauthorized responses.

The backend starts at `backend/src/index.js`, loads environment variables, connects to MongoDB, and starts the Express server. `backend/src/app.js` configures CORS, cookies, body parsing, static files, route mounting, and centralized error handling. Routes delegate business logic to controllers, which use Mongoose models and Cloudinary utilities.

## Important Backend Domains

| API prefix | Responsibility |
|---|---|
| `/api/v1/users` | Registration, login, logout, refresh, profiles, history, OAuth |
| `/api/v1/videos` | Video listing, publishing, playback metadata, editing, deletion, views |
| `/api/v1/comments` | Video comment CRUD |
| `/api/v1/likes` | Video likes and liked-video listings |
| `/api/v1/playlist` | Playlist CRUD and video membership |
| `/api/v1/subscriptions` | Channel subscription relationships |
| `/api/v1/dashboard` | Creator statistics and creator video management |
| `/api/v1/healthcheck` | Service health probe |

Core persistence models include `User`, `Video`, `Comment`, `Like`, `PlayList`, and `Subscription`. MongoDB stores application metadata and relationships; Cloudinary stores binary media and returns URLs/public IDs saved with the relevant documents.

## Frontend Organization

- `frontend/src/pages/` contains route-level composition such as `Home`, `LandingPage`, `VideoPlayer`, `Channel`, `Upload`, `Search`, `Profile`, `History`, `Subscriptions`, and playlist pages.
- `frontend/src/components/` contains reusable layout, UI, and feature components.
- `frontend/src/context/` contains authentication, video, and UI state providers.
- `frontend/src/hooks/` contains reusable data-fetching and interaction logic.
- `frontend/src/services/` contains the Axios client and grouped endpoint methods.
- `frontend/src/styles/` and `frontend/src/tokens/` define the theme-aware design system.

Pages should remain focused on composition. Reusable behavior belongs in hooks, contexts, services, or feature components rather than being duplicated across route files.

## Development Commands

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend, in a second terminal
cd frontend
npm install
npm run dev

# Frontend validation
npm run build
npm run lint
```

The backend normally runs on port `8000`; the frontend runs on port `5173`. Required backend configuration includes MongoDB, JWT secrets/expiries, CORS origin, and Cloudinary credentials. The frontend uses `VITE_API_BASE_URL`, normally `http://localhost:8000/api/v1`.

## Change Guidelines

1. Read the relevant existing page, hook, context, service, route, controller, and model before changing behavior.
2. Preserve existing API paths, response shapes, field names, token behavior, and multipart field names.
3. Keep route declarations in `backend/src/routes/` and business logic in controllers.
4. Use established `asyncHandler`, `ApiError`, `ApiResponse`, JWT middleware, optional-auth middleware, and Cloudinary helpers.
5. Reuse frontend primitives and semantic design tokens; do not introduce arbitrary colors or duplicate components.
6. Preserve loading, empty, error, validation, authentication, toast, upload-progress, responsive, and reduced-motion states.
7. Make the smallest complete change and avoid unrelated rewrites.
8. For a new feature, first document the finalized scope, affected files, acceptance criteria, and validation steps in `context/features/`.
9. Update `context/build-plan.md` and `context/progress-tracker.md` when a feature is approved or completed.
10. Do not implement rough ideas directly from `context/NEXT_work.md` until they have been discussed and converted into a feature prompt.

## Current Project State

The core platform and UI foundation are substantially implemented. The project is in ongoing feature development, so future work should extend the existing Vidora product rather than replace its working architecture or API contracts. The primary acceptance path is: a creator registers, uploads a video and thumbnail, publishes it, and sees it in the feed; a viewer watches it, likes it, comments, and subscribes to the channel.

## Out of Scope Unless Explicitly Approved

- Live streaming through HLS or WebRTC.
- Server-side rendering or hydration.
- Email or push notifications.
- End-to-end testing infrastructure.
- Internationalization.
- PWA offline support.
- New public aggregate analytics endpoints.

## Source of Truth

When this file conflicts with implementation details, inspect the current code and the more specific project documents first:

- `context/project-overview.md`
- `context/architecture.md`
- `context/code-standards.md`
- `context/ui-rules.md`
- `docs/01_SRD.md`
- `docs/APP_FLOW.md`
- `frontend/src/services/endpoints.js`
- `backend/src/routes/`

Keep this file concise and update it when the project architecture, major product scope, or development workflow changes.
