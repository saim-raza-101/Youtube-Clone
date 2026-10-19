# App Flow: Vidora

Comprehensive application flow for **Vidora**, a full-stack video-sharing platform (React 19 + Vite SPA on `:5173`, Express REST API on `:8000`, MongoDB + Cloudinary).

Context: viewers browse and watch videos as guests or members; authenticated creators upload videos, run channels, and view analytics.

---

## 1. Entry points

- **Direct URL access** — `/` (landing page for logged-out visitors, home feed for users/guests)
- **OAuth/social login** — GitHub OAuth via `GET /api/v1/users/auth/github`, returning to `/auth/callback`
- **Deep links** — `/video/:videoId` (shared video links), `/channel/:username` (shared channel links), `/search?q=...`
- **Search engines** — static marketing pages (`/`, `/pricing`) are indexable (no SSR yet)
- **Guest mode** — visitors can enter the home feed without an account

---

## 2. Core user flows

### A. Registration / Login (onboarding)

**HAPPY PATH**
1. `/` (LandingPage) → user clicks **Sign up** or **Log in** → `/register` or `/login`
2. Register screen: `username`, `fullName`, `email`, `password`, optional `avatar` + `coverImage` dropzones → submit `POST /api/v1/users/register` (multipart)
3. Login screen: `email` + `password` → `POST /api/v1/users/login`
4. API returns user + sets refresh-token cookie; `AuthContext` stores the access token and user
5. Redirect to `/` → Home feed loads (`GET /api/v1/videos`)
6. Success criteria: navbar shows avatar/menu; protected pages are reachable

Alternative: **GitHub** button → `GET /users/auth/github` → GitHub consent → `/auth/callback` exchanges the code and logs the user in.

**ERROR STATES**
- Duplicate username/email or missing field → `400/409` shown as a toast; form keeps values
- Wrong credentials → `401`; no token stored
- Network/API down → error toast; user stays on the form

**EDGE CASES**
- Already logged in visiting `/login` or `/register` → redirected to `/`
- Session expiry mid-use → Axios response interceptor clears auth and redirects to `/login`
- Abandoned form → no partial account created

### B. Watch & interact with a video (main feature)

**HAPPY PATH**
1. Home `/` → featured hero video + category chips + video grid → click a `VideoCard`
2. `/video/:videoId` → `GET /videos/:videoId` (detail) + related videos + comments
3. Player starts; `PATCH /videos/views/:videoId` increments the view count
4. Actions: **Like** → `POST /likes/toggle/v/:videoId`; **Comment** → `POST /comments/:videoId`; **Subscribe** → `POST /subscriptions/c/:channelId`; **Save** → `PATCH /playlist/add/:videoId/:playlistId`; **Share** copies the link
5. Success criteria: counts update immediately and persist after refresh

**ERROR STATES**
- Invalid/deleted video ID → `404` → error state with a way back home
- Actions while signed out → prompt to log in (`401` handled by interceptor)
- Playback failure (bad Cloudinary URL/network) → player error state; metadata still shown

**EDGE CASES**
- Double-clicking Like → toggle is idempotent per request; UI reflects final server state
- Guest mode → browsing works; mutating actions require login
- Back navigation → returns to the feed with filters intact (VideoContext)

### C. Upload / edit a video (creator flow)

**HAPPY PATH**
1. Navbar **Upload** → `/upload` (auth required; otherwise redirected to `/login`)
2. Dropzone selects `videoFile` + `thumbnail`, enter `title`, `description`, `duration` (auto from file)
3. Submit → `POST /videos` (multipart) with `UploadProgressBar` showing progress
4. Success → toast → redirect to `/video/:videoId` or the channel
5. Edit: `/video/edit/:videoId` → `PATCH /videos/:videoId` (optional new thumbnail)
6. Dashboard `/` creator tab → toggle publish (`PATCH /videos/toggle/publish/:videoId`) or delete (`DELETE /videos/:videoId`)

**ERROR STATES**
- Missing file/title/description → `400` validation error; nothing saved
- File too large / Cloudinary failure → error toast; upload did not claim success
- Not the owner → `403`

**EDGE CASES**
- User abandons upload → no record created (server only writes after successful Cloudinary upload)
- Session expires during upload → interceptor redirects to login; re-authenticate and retry
- Concurrent edits → last write wins (`updatedAt` reflects the newest save)

### D. Account management

**HAPPY PATH**
1. `/profile` → edit `fullName`/`email` → `POST /users/update-account`
2. Change avatar/cover → `PATCH /users/change-avatar` / `change-cover-image` (multipart)
3. Change password → `POST /users/change-password`
4. Logout → `POST /users/logout` → token cleared → `/` landing

**ERROR STATES**
- Wrong old password → `401/400` error message
- Unauthenticated session → redirect to `/login`

### E. Error recovery

- API errors → centralized handler returns `{ statusCode, message }` → toast via `ToastContainer`
- Unexpected render errors → `ErrorBoundary` around page content with a recovery UI
- 404/unknown routes → `*` route redirects to `/`
- Expired access token → silent refresh via `POST /users/refresh-token`, otherwise clear auth and redirect to `/login`

---

## 3. Navigation map

```text
/ (Landing if logged out | Home feed if user or guest)
├── /login
├── /register
├── /auth/callback
├── /search?q=
├── /video/:videoId
│   └── /video/edit/:videoId          [owner, auth]
├── /channel/:username
├── /pricing
├── /contact
└── App shell (Navbar + Sidebar)      [auth recommended]
    ├── /           Home feed
    ├── /upload                         [auth]
    ├── /playlists                      [auth]
    │   └── /playlists/:id              [auth]
    ├── /liked-vidoes                   [auth]
    ├── /history                        [auth]
    ├── /subscriptions                  [auth]
    ├── /profile                        [auth]
    └── /pricing
```

Cross-links: every `VideoCard` → `/video/:videoId`; channel names/avatars → `/channel/:username`; search in Navbar → `/search`; Sidebar sections mirror the App shell list above.

---

## 4. Screen inventory

| Route | Access | Purpose | Key actions | States |
|---|---|---|---|---|
| `/` | Public → feed for user/guest | Landing / home feed with hero, category chips, grid | Browse, filter, open video | Loading skeleton, empty, error |
| `/login` | Public (redirect if authed) | Sign in | Submit credentials, GitHub OAuth | Error, submitting |
| `/register` | Public (redirect if authed) | Create account | Fill form, pick avatar/cover | Validation, uploading |
| `/auth/callback` | Public | OAuth token handoff | — | Redirecting, error |
| `/video/:videoId` | Public | Watch, interact, related videos | Play, like, comment, subscribe, save, share | Player error, no comments, loading |
| `/video/edit/:videoId` | Auth + owner | Edit metadata/thumbnail | Save, cancel | Saving, error |
| `/channel/:username` | Public | Channel profile, videos, playlists, tabs | Subscribe, open videos | Empty channel, loading |
| `/search` | Public | Search results | Refine query | No results, loading |
| `/upload` | Auth | Publish video | Drop files, submit | Upload progress, validation error |
| `/playlists` | Auth | List own playlists | Create playlist | Empty, loading |
| `/playlists/:id` | Auth | Playlist detail | Add/remove videos, delete | Empty, loading |
| `/liked-vidoes` | Auth | Liked videos | Open video | Empty, loading |
| `/history` | Auth | Watch history | Open video | Empty, loading |
| `/subscriptions` | Auth | Subscribed channels | Open channel, unsubscribe | Empty, loading |
| `/profile` | Auth | Profile & settings | Update account, avatar, cover, password | Saving, error |
| `/pricing` | Public | Plans page | — | Static |
| `/contact` | Public | Contact page | Submit message | Success, error |
| `*` | Public | Unknown route | Redirect → `/` | — |

---

## 5. Decision points

- **IF** no access token **THEN** protected pages (`/upload`, `/profile`, `/playlists`, `/liked-vidoes`, `/history`, `/subscriptions`, `/video/edit/:id`) require login; mutating actions prompt for auth.
- **IF** `user` or `guestMode` is true at `/` **THEN** render Home feed, **ELSE** render LandingPage.
- **IF** user is logged in and opens `/login` or `/register` **THEN** redirect to `/`.
- **IF** access token request returns `401` **THEN** attempt `POST /users/refresh-token`; **IF** refresh fails **THEN** clear auth state and redirect to `/login`.
- **IF** the current user is the video/comment/playlist owner **THEN** show edit/delete controls; **ELSE** hide them (server independently enforces `403`).
- **IF** `video.isPublished === false` **THEN** the video stays hidden from the public feed; **IF** toggled **THEN** it appears/disappears immediately.
- **IF** like/subscribe request succeeds **THEN** flip the local button state from the server response; **IF** it fails **THEN** revert and show an error toast.
- **IF** upload response fails (missing file, Cloudinary error) **THEN** show an error and keep the form; **ELSE** show success and navigate to the new video.
- **IF** a list response is empty **THEN** render the empty state (not an error); **IF** the request errors **THEN** render the error state with retry.
