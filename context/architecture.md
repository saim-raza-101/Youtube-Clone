# Vidora Architecture

## System Shape

```text
React/Vite SPA (frontend :5173)
        |
        | Axios JSON + multipart requests
        v
Express REST API (backend :8000)
        |
        +--> MongoDB via Mongoose
        +--> Cloudinary for video/image storage
        +--> JWT access/refresh token flow
```

## Frontend Architecture

### Entry and routing

- `frontend/src/main.jsx` mounts the React application and global CSS.
- `frontend/src/App.jsx` creates the router, provider hierarchy, startup loader, shared page layout, and route map.
- `PageLayout` composes `Navbar`, `Sidebar`, page content, error boundary, and upload progress UI.
- Routes are handled by React Router. Public and authenticated behavior is enforced by page logic, `AuthContext`, and `useRequireAuth`.

### State and data

- `AuthContext.jsx`: current user, token, guest mode, login/register/logout, OAuth token login, and profile updates.
- `VideoContext.jsx`: shared video collection, selected video, loading/error state, and filters.
- `UIContext.jsx`: sidebar state, theme, notifications, selected video, and upload progress.
- `services/api.js`: one Axios client, base URL/timeout configuration, auth request interceptor, and unauthorized response handling.
- `services/endpoints.js`: grouped API methods for videos, comments, likes, playlists, channels, dashboard, users, and search.
- `hooks/`: page-level data and interaction orchestration, including channel, comments, history, likes, playlists, profile, related videos, subscriptions, uploads, and video details.

### UI organization

- `components/layout/`: global navigation and shell.
- `components/common/`: loaders, error/empty states, category chips, stats, and shared media helpers.
- `components/ui/`: primitive controls such as buttons, inputs, cards, dialogs, modals, skeletons, spinners, toasts, and upload progress.
- Feature folders (`auth`, `home`, `video`, `videoPlayer`, `channel`, `comments`, `playlist`, `profile`, `upload`, `subscriptions`, `likedVideos`) contain focused UI pieces.
- `pages/`: route-level composition only; business logic should remain in hooks, contexts, or services.

## Backend Architecture

### Startup and middleware

- `backend/src/index.js` loads environment variables, connects to MongoDB, and starts the HTTP server.
- `backend/src/app.js` configures CORS, cookies, URL-encoded/JSON bodies, static public files, route mounting, and centralized error handling.
- `db/index.js` owns the Mongoose connection.
- `constants.js` contains shared backend constants such as the database name.

### API layers

- `routes/`: endpoint paths and middleware composition.
- `controllers/`: request validation, database operations, Cloudinary calls, aggregation, and response creation.
- `models/`: Mongoose schemas for users, videos, comments, likes, playlists, and subscriptions.
- `middleware/`: JWT verification, optional authentication, and Multer upload handling.
- `utils/`: async wrapper, error/response classes, centralized error handler, Cloudinary helpers, like toggle helper, and OAuth helpers.

### Mounted API domains

| Prefix | Responsibility |
|---|---|
| `/api/v1/users` | registration, login, logout, refresh, current user, profile, history, OAuth |
| `/api/v1/healthcheck` | service health |
| `/api/v1/videos` | listing, publishing, reading, editing, deleting, views, publish state |
| `/api/v1/comments` | video comments CRUD |
| `/api/v1/likes` | liked videos and video-like toggle |
| `/api/v1/playlist` | playlist CRUD and video membership |
| `/api/v1/subscriptions` | channel subscribers and subscriptions |
| `/api/v1/dashboard` | creator statistics and creator videos |

## Persistence Model

- `User`: identity, credentials/provider identity, avatar, cover image, refresh token, and watch history.
- `Video`: Cloudinary video/thumbnail references, title, description, duration, views, publish state, and owner.
- `Comment`: content, owner, video, timestamps.
- `Like`: liked video/comment references and user.
- `PlayList`: name, description, owner, and video references.
- `Subscription`: subscriber/channel relationship.

Cloudinary stores binary media; MongoDB stores metadata and Cloudinary URLs/public IDs.

## Change Boundaries

- UI-only changes may touch JSX, Tailwind/CSS, motion, accessibility, and component composition.
- Behavior changes must trace the full path: page/component -> hook/context -> endpoint service -> route/controller -> model/provider.
- Do not silently change API contracts, token storage, model field names, or route semantics.
- Add backend changes only when the finalized feature explicitly requires persistence or server behavior.
