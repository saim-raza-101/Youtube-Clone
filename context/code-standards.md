# Vidora Code Standards

## Working Principle

Vidora is an existing production-style codebase. Read the current implementation before editing. Make the smallest complete change that satisfies the finalized feature and preserve unrelated work.

## Frontend

- Use React functional components and hooks.
- Keep route pages focused on composition; move reusable behavior into hooks, contexts, or services.
- Reuse primitives from `components/ui/` and shared states from `components/common/`.
- Use named exports where the surrounding file follows that convention; preserve local conventions when touching legacy files.
- Use Tailwind utilities and the semantic CSS variables in `frontend/src/styles/globals.css`; avoid new hardcoded colors.
- Keep responsive behavior for desktop, tablet, and mobile.
- Preserve loading, error, empty, toast, and upload-progress states.
- Use Framer Motion for subtle, purposeful motion. Respect reduced-motion behavior.
- Keep accessibility: semantic elements, labels, keyboard access, visible focus, alt text, and appropriate ARIA.
- Avoid unnecessary effects, duplicate API calls, broad state, and large page components.

## Backend

- Keep route declarations in `routes/` and business operations in `controllers/`.
- Use `asyncHandler`, `ApiError`, and `ApiResponse` patterns already established in the backend.
- Protect authenticated operations with `VerifyJWT`; use `optionalAuth` only for intentionally public endpoints.
- Validate IDs and request data before database work.
- Scope owner-specific operations to the authenticated user.
- Use Mongoose models and aggregation patterns already used by the domain.
- Use Cloudinary utilities for media rather than duplicating upload/delete logic.
- Return consistent API response shapes and route errors through the central error handler.
- Do not expose secrets, tokens, raw stack traces, or provider credentials.

## API and Compatibility

- Treat `frontend/src/services/endpoints.js` and backend route files as a contract.
- Do not rename fields, URL paths, token keys, or response envelopes without an explicit migration plan.
- Multipart requests must retain the expected field names (`videoFile`, `thumbnail`, `avatar`, and `coverImage`).
- New endpoints need corresponding service methods, auth decisions, error states, and validation.

## Documentation and Workflow

- Update the relevant context file when architecture or UI conventions change.
- Keep `context/build-plan.md` short and dynamic.
- Keep `context/progress-tracker.md` current but lightweight.
- Record rough future ideas in `context/NEXT_work.md`; do not implement ideas directly from that file.
- After discussion, create a feature prompt in `context/features/` (for example `login_feature.md`) containing scope, affected files, acceptance criteria, and validation.
