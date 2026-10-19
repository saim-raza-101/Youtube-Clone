# Vidora Project Overview

## Purpose

Vidora is a full-stack video-sharing platform inspired by the core experience of a modern video community. Users can create accounts, publish videos, watch and search content, interact through likes and comments, follow channels, build playlists, and manage their own profile and creator activity.

The repository is already substantially implemented. Future work should extend the existing product without replacing working business logic or API contracts.

## Product Areas

- Public landing page and guest browsing
- Registration, login, logout, token refresh, and GitHub OAuth callback
- Home feed with categories, featured content, video cards, loading states, and empty/error states
- Video playback, related videos, view tracking, likes, comments, playlists, and sharing actions
- Video upload and edit flows with video and thumbnail files
- Channel pages with creator information, videos, playlists, tabs, and subscription controls
- Search, watch history, liked videos, and subscribed channels
- Profile/account settings, avatar, cover image, and account updates
- Creator dashboard with channel statistics and creator video management
- Pricing and contact pages
- Theme-aware responsive interface with Framer Motion transitions

## Core User Flows

1. A visitor lands on the public page or enters guest mode.
2. A registered user logs in and receives a JWT access token stored by the frontend.
3. Authenticated requests send the token through the shared Axios interceptor.
4. Users browse, search, open, like, comment on, and save videos.
5. Creators upload media and thumbnails; the API uploads media to Cloudinary and stores metadata in MongoDB.
6. Users visit channels, subscribe/unsubscribe, view history, and manage playlists.
7. Expired or invalid authentication is cleared by the API response interceptor and the user is redirected to login.

## Repository Reality

This is a two-application repository:

- `frontend/`: React 19 + Vite single-page application.
- `backend/`: Express 5 REST API using MongoDB/Mongoose.
- `media/`: design references and screenshots.
- `context/`: project-specific working context for future AI-assisted changes.

The frontend and backend are independently installed and run. They communicate through `/api/v1`.

## Important Constraints

- Preserve existing API endpoints, response shapes, route paths, auth behavior, and custom hooks.
- Treat the backend as the source of truth for persistence and business operations.
- Prefer reusable frontend components over page-level duplication.
- For UI work, change presentation first and avoid changing data behavior.
- Inspect the relevant existing page, hooks, context, services, and backend endpoint before implementation.
- Every new feature must have an agreed scope, implementation prompt, validation steps, and a progress update.

## Current Product State

The product is mostly built. The next work is intentionally open-ended: new features will be proposed in `context/NEXT_work.md`, discussed and finalized, then converted into a feature-specific implementation prompt before code changes begin.
