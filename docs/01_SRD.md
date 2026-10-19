# SRD: Vidora MVP

> Keep this short. Update it only when the build scope changes.

## Goal
Let viewers browse and watch videos freely, and let creators publish videos, grow a channel, and manage their content — a self-hosted video-sharing platform.

## Users
- **Viewer (or guest):** browses the home feed, watches videos, searches, likes, comments, builds playlists, and subscribes to channels. Guest mode allows browsing without an account.
- **Creator (authenticated user):** uploads and edits videos, manages their channel, views dashboard analytics (views, subscribers, videos), and manages profile/settings.

## MVP workflow
1. Visitor lands on the public page or enters guest mode; a registered user logs in (email/password or GitHub OAuth) and receives a JWT access token.
2. User browses the home feed (featured hero, category chips, video grid) or searches.
3. User opens a video: it plays, the view count increments, and related videos are shown.
4. User likes the video, comments, subscribes to the channel, or saves the video to a playlist.
5. Creator uploads a video (video file + thumbnail), then edits metadata, toggles publish state, or deletes it from the dashboard.

## Must-have
- Authentication: register, login, logout, refresh-token, GitHub OAuth, access checks on protected routes
- Video CRUD with Cloudinary upload (video + thumbnail), publish/draft toggle, view tracking
- Comments and video like/unlike, liked-videos list
- Channel pages with subscribe/unsubscribe, watch history, playlists (create/update/delete/add/remove)
- Creator dashboard with channel stats and creator video management
- Loading, empty, and error states across pages; light/dark theme

## Not in MVP
Live streaming, SSR/SEO hydration, email/push notifications, end-to-end test suite, i18n, PWA offline support, public (aggregate) analytics endpoints.

## Acceptance check
A creator can register, upload a video with a thumbnail, and see it in the feed; a viewer can watch it, like it, comment, and subscribe to the channel; a non-owner cannot edit or delete the video, and a signed-out user is rejected on protected endpoints.

## Build notes
React 19 + Vite SPA (`frontend/`, port 5173); Express 5 REST API (`backend/`, port 8000) on MongoDB/Mongoose; Cloudinary for media storage; JWT access (1d) + refresh (7d) tokens. Frontend and backend are independent apps communicating over `/api/v1`. Deploy backend to a Node host (Render/Railway) and frontend to a static host (Vercel/Netlify).

---

## Reusable prompt

```text
Create or update a concise SRD from the project context and existing files.
Include: goal, users, main workflow, must-have features, out-of-scope items, and one acceptance check.
Focus on one complete end-to-end workflow we can build in the workshop.
Do not invent requirements or technologies; mark unknowns as [DECIDE].
If an SRD already exists, update it rather than creating a duplicate.
Output Markdown only.
Project: [NAME + TWO-SENTENCE DESCRIPTION]
```
