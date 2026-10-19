# API Contract: Vidora

> Document the endpoints used by the app. Keep examples aligned with the code.

Base path: `/api/v1`

Auth: `Authorization: Bearer <accessToken>` header or the HTTP-only cookie set on login. `Optional` means the endpoint works for guests but enriches the response when a valid token is sent.

## Auth & users

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/users/register` | No | Register (multipart: `username`, `fullName`, `email`, `password`, optional `avatar`, `coverImage`) |
| POST | `/users/login` | No | Login with `email` + `password`; sets refresh-token cookie |
| POST | `/users/logout` | JWT | Clear refresh token and cookie |
| POST | `/users/refresh-token` | No (cookie) | Issue a new access token from the refresh token |
| GET | `/users/current-user` | JWT | Current authenticated user |
| POST | `/users/change-password` | JWT | Change password (`oldPassword`, `newPassword`) |
| POST | `/users/update-account` | JWT | Update `fullName` / `email` |
| PATCH | `/users/change-avatar` | JWT | Multipart `avatar` file |
| PATCH | `/users/change-cover-image` | JWT | Multipart `coverImage` file |
| GET | `/users/c/:username` | No | Public channel profile with subscriber/video counts |
| GET | `/users/history` | JWT | Watch history (populated videos) |
| GET | `/users/auth/github` | No | Redirect to GitHub OAuth |
| GET | `/users/auth/github/callback` | No | OAuth callback; issues tokens and redirects to the app |

Example — `POST /users/login`:

Request:
```json
{ "email": "creator@example.com", "password": "secret123" }
```

Success `200`:
```json
{
  "statusCode": 200,
  "data": { "user": { "_id": "u_123", "username": "creator", "fullName": "Saim Raza", "email": "creator@example.com", "avatar": { "url": "...", "public_id": "..." } } },
  "message": "User logged in successfully"
}
```

Errors: `400` invalid input or missing fields · `401` wrong credentials · `409` duplicate username/email

## Videos

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/videos` | Optional | Paginated, filterable, sortable video list |
| POST | `/videos` | JWT | Publish video (multipart: `videoFile`, `thumbnail`, `title`, `description`, `duration`) |
| GET | `/videos/:videoId` | Optional | Single video detail (owner populated) |
| PATCH | `/videos/:videoId` | JWT (owner) | Update metadata; multipart `thumbnail` optional |
| DELETE | `/videos/:videoId` | JWT (owner) | Delete video and its Cloudinary assets |
| PATCH | `/videos/toggle/publish/:videoId` | JWT (owner) | Toggle `isPublished` draft/published state |
| PATCH | `/videos/views/:videoId` | No | Increment view count |

Example — `POST /videos` (multipart form):

```text
title: "My first video"
description: "Uploaded through Vidora"
duration: 132
videoFile: <file>
thumbnail: <file>
```

Success `201`:
```json
{ "statusCode": 201, "data": { "video": { "_id": "v_123", "title": "My first video", "isPublished": true, "views": 0, "owner": "u_123" } }, "message": "Video published successfully" }
```

Errors: `400` missing file or fields · `401` not signed in · `404` video not found · `403` not the owner

## Comments

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/comments/:videoId` | No | Paginated comments for a video |
| POST | `/comments/:videoId` | JWT | Add comment (`content`) |
| PATCH | `/comments/c/:commentId` | JWT (owner) | Edit comment (`content`) |
| DELETE | `/comments/c/:commentId` | JWT (owner) | Delete comment |

Example — `POST /comments/:videoId`:
```json
{ "content": "Great video!" }
```

Success `201` returns the created comment. Errors: `400` empty content · `401` not signed in · `404` video/comment not found · `403` not the owner

## Likes

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/likes/toggle/v/:videoId` | JWT | Like / unlike a video |
| GET | `/likes/videos` | JWT | Current user's liked videos |

Note: comment-like and tweet-like routes exist in the schema but are not mounted yet.

Example — `POST /likes/toggle/v/:videoId` success `200`:
```json
{ "statusCode": 200, "data": { "liked": true }, "message": "Video liked" }
```

Errors: `401` not signed in · `404` video not found

## Playlists

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/playlist` | JWT | Create playlist (`name`, optional `description`) |
| GET | `/playlist/user/:userId` | No | A user's playlists |
| GET | `/playlist/:playlistId` | Optional | Playlist detail (videos populated) |
| PATCH | `/playlist/:playlistId` | JWT (owner) | Rename / update description |
| DELETE | `/playlist/:playlistId` | JWT (owner) | Delete playlist |
| PATCH | `/playlist/add/:videoId/:playlistId` | JWT (owner) | Add video to playlist |
| PATCH | `/playlist/remove/:videoId/:playlistId` | JWT (owner) | Remove video from playlist |

Errors: `400` duplicate video in playlist · `401` not signed in · `403` not the owner · `404` not found

## Subscriptions

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/subscriptions/c/:channelId` | JWT | Subscribe / unsubscribe (toggle) |
| GET | `/subscriptions/c/:channelId` | JWT | Subscribers of a channel |
| GET | `/subscriptions/u/:subscriberId` | JWT | Channels the user is subscribed to |

Example — `POST /subscriptions/c/:channelId` success `200`:
```json
{ "statusCode": 200, "data": { "subscribed": true }, "message": "Subscribed" }
```

Errors: `401` not signed in · `404` channel not found

## Dashboard & health

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/dashboard/stats` | JWT | Channel statistics (total views, subscribers, videos, likes) |
| GET | `/dashboard/videos` | JWT | The current user's videos |
| GET | `/healthcheck` | No | Service health probe |

## Contract rules
- Validate input on the server; reject empty or oversized bodies (JSON limit 20kb).
- Derive `owner`, `subscriber`, creator IDs, and timestamps from trusted auth/server context — never from the client body.
- Every response follows the shared shape: `{ statusCode, data, message, success }`; errors go through the centralized error handler with no stack traces or secrets exposed.
- Media binaries go to Cloudinary; MongoDB stores only URLs and `public_id`s.
- Use consistent errors; do not expose secrets or stack traces.

---

## Reusable prompt

```text
Draft a concise API contract from the SRD and current code.
For each required endpoint include method/path, purpose, auth/access rule, minimal request and success JSON, and expected errors.
Keep names, fields, and enums consistent with the SRD and data model.
Do not invent endpoints or fields; mark unknowns as [DECIDE].
If code exists, document the real behavior instead of silently redesigning it.
Output Markdown only.
Sources: [SRD PATH], [DATA MODEL PATH], [ROUTE/SCHEMA PATHS]
```
