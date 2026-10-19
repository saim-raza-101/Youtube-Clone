# PRD: Vidora — Full-Stack Video Sharing Platform

Context:
- Target Users: Viewers who want to watch and share videos without friction; creators who want to publish content, grow a channel, and see basic analytics.
- Main Problem: Existing video platforms are closed, ad-heavy, and don't let individuals self-host a polished video community with real accounts, channels, and engagement.
- Unique Value: A production-quality, self-hostable MERN video platform with JWT auth, Cloudinary-backed streaming, and a premium theme-aware UI — everything needed for a real video community in one repo.

---

## 1. Problem statement

Aspiring creators and small communities need a place to publish videos, build an audience, and interact — without depending on a large third-party platform or building each piece (auth, uploads, comments, subscriptions, analytics) from scratch. Logging in, sharing a link, watching a video, and engaging with a channel must work end to end, on any device, in light or dark mode.

## 2. Goals & objectives

1. **G0 — Working end-to-end video journey:** a creator can register, upload a video with a thumbnail, and have it playable from the feed within 2 minutes of signup.
2. **G1 — Full engagement loop:** viewers can like, comment, subscribe, save to playlists, and build watch history — with state persisting across sessions.
3. **G2 — Secure access:** 100% of mutating endpoints require JWT auth, and ownership checks prevent non-owners from editing/deleting content.
4. **G3 — Polished experience:** every page has loading, empty, and error states; the UI is responsive and theme-aware with no hardcoded colors.
5. **G4 — Deployable:** frontend builds to static hosting and the backend runs on any Node host with environment-driven configuration.

## 3. Success metrics

- Time from signup to first successful video upload: **< 2 minutes**
- Core workflow (login → watch → like → comment → subscribe) completes with **0 console errors** and **0 unhandled 4xx/5xx**
- **100%** of protected routes reject signed-out requests with `401`
- Page loads show skeleton/loading states instead of blank screens on **100%** of data-driven pages
- Production build passes: `npm run lint` and `npm run build` both clean

## 4. Target personas

**Persona A — "Saim, the creator"**
- Demographics: 20s–30s, developer/designer publishing tutorials and showcase videos
- Pain points: wants channel analytics, thumbnail control, and draft/publish flexibility; hates clunky upload UIs
- Goals: upload fast, track views/subscribers, keep content organized in playlists
- Technical proficiency: high — comfortable with self-hosting and env configuration

**Persona B — "Ali, the viewer"**
- Demographics: 18–40, casual viewer who browses on desktop and mobile
- Pain points: dislikes forced signups just to browse; wants quick search, history, and saved playlists
- Goals: discover videos, follow channels, pick up where they left off
- Technical proficiency: low–medium — expects consumer-grade polish, dark mode, and instant feedback

## 5. Features & requirements

### P0 (Must-Have — MVP)
- **Authentication & accounts**
  - As a visitor, I want to register or log in (email/password or GitHub) so that I can access member features.
  - AC: register creates an account and logs the user in; login returns a JWT; logout clears tokens; expired access tokens refresh silently via refresh token; GitHub OAuth lands on `/auth/callback` and establishes a session.
- **Video publishing**
  - As a creator, I want to upload a video file plus thumbnail with title/description so that viewers can watch it.
  - AC: multipart upload succeeds; video appears on my channel and in the feed; missing file or title returns a validation error; only the owner can edit or delete it; publish/draft can be toggled.
- **Watching & discovery**
  - As a viewer, I want to browse the home feed, search, and open videos so that I can find content.
  - AC: feed is paginated/filterable; opening a video increments views; related videos display; unknown video IDs show an error state.
- **Engagement**
  - As a viewer, I want to like, comment, and subscribe so that I can interact with creators.
  - AC: like toggles and persists; comments CRUD works for the comment owner; subscribe toggles and subscriber counts update; signed-out users get `401`.
- **Personal library**
  - As a user, I want playlists, watch history, and liked videos so that I can save and resume content.
  - AC: create/rename/delete playlist; add/remove videos; history records watched videos; liked list matches likes.
- **Channel & dashboard**
  - As a creator, I want a channel page and dashboard so that I can manage my presence.
  - AC: channel shows profile, videos, playlists, subscribe button; dashboard shows total views, subscribers, videos and lists my videos for management.
- **Profile & settings**
  - As a user, I want to update my name/email, avatar, cover image, and password.
  - AC: each update persists and reflects immediately in the UI.

### P1 (Should-Have)
- Comment likes (schema exists; routes not yet mounted)
- Contact page form submission
- Category-based filtering polish and search ranking improvements
- Upload resumability / chunked uploads

### P2 (Nice-to-Have)
- Live streaming (HLS/WebRTC), SSR for SEO, in-app + email notifications, public aggregate analytics, Playwright E2E suite, i18n, PWA offline support (mirrors the repo roadmap)

## 6. Explicitly out of scope

1. Live streaming or HLS/WebRTC delivery
2. Server-side rendering / hydration
3. Email or push notifications
4. Payments or monetization (pricing page is display-only)
5. Ads serving beyond the player placeholder
6. Multi-user moderation/admin panel and reporting tools
7. Direct messaging or real-time chat
8. Mobile native apps (responsive web only)
9. Comment-like and tweet-like features (routes not mounted)
10. i18n and offline/PWA support

## 7. User scenarios

**Scenario 1 — First-time creator publishes**
- Context: new creator just signed up.
- Steps: land on `/` → register with avatar → `/upload` → drop video + thumbnail → fill title/description → submit → progress bar → success toast → redirected to the new video.
- Outcome: video is live, viewable in feed and on the channel.
- Edge cases: missing thumbnail is rejected (or defaults); Cloudinary failure shows an error and no partial record.

**Scenario 2 — Viewer engages and returns**
- Context: guest browses, then decides to engage.
- Steps: `/` in guest mode → open video → click Like → prompted to log in → login → returns to video → likes, comments, subscribes → next day logs in and finds the video in History and Liked Videos.
- Outcome: engagement persisted across the session and device restarts.
- Edge cases: expired token on return is refreshed silently; empty history shows an empty state, not an error.

**Scenario 3 — Creator manages content**
- Context: creator wants to update an old video.
- Steps: channel page or dashboard → open `/video/edit/:id` → change title and thumbnail → save → toggle to draft → video disappears from feed → toggle back → video returns.
- Outcome: only the owner can perform these actions; a non-owner URL shows denied/not-found.
- Edge cases: concurrent edits — last write wins; deleting removes the video and its media.

## 8. Non-functional requirements

- **Performance:** feed paginated via aggregation pipelines; API JSON body limit 20kb; Axios timeout configured (`VITE_API_TIMEOUT`); media streamed from Cloudinary CDN.
- **Security:** bcrypt password hashing (10 rounds); JWT access (1d) / refresh (7d) with separate secrets; HTTP-only refresh cookie; ownership enforced server-side; centralized error handler hides stack traces and secrets.
- **Accessibility & UX:** semantic design tokens (no hardcoded colors), responsive layout (desktop/tablet/mobile), keyboard-reachable controls, loading skeletons, empty and error states everywhere.
- **Scalability:** stateless API (horizontal scaling), MongoDB indexes on unique username/email and OAuth compound key, aggregation pagination for large lists.

## 9. Dependencies & constraints

- **External services:** MongoDB (local or Atlas), Cloudinary (video/image storage), GitHub OAuth app.
- **Environment:** `PORT`, `MONGODB_URI`, `CORS_ORIGIN`, `JWT_ACCESS_TOKEN_SECRET/EXPIRY`, `JWT_REFRESH_TOKEN_SECRET/EXPIRY`, `CLOUDINARY_*` (backend); `VITE_API_BASE_URL`, `VITE_API_TIMEOUT` (frontend).
- **Constraints:** two independently deployed apps communicating only over `/api/v1`; existing API contracts, route paths, model field names, and token behavior must be preserved; no `.env` secrets may be committed.

## 10. Timeline

| Milestone | Contents |
|---|---|
| **MVP (shipped)** | Auth (local + GitHub), video publish/stream/CRUD, comments, likes, subscriptions, playlists, history, channel + dashboard, profile settings, theme-aware responsive UI |
| **V1.0 (next)** | Comment likes, contact form handling, search/filter polish, upload UX hardening |
| **Later** | SSR, notifications, E2E suite, live streaming, i18n, PWA (see README roadmap) |

---

CRITICAL REQUIREMENTS (from template, retained):
- Use specific, measurable criteria (not vague)
- Avoid deep implementation details — focus on WHAT to build, not HOW
- Make every requirement testable; include edge cases and error states
- Be explicit about what is NOT included
