# Test Plan: Vidora

> Test the main user journey and highest-risk failure cases. Keep it small.

## Critical tests

| ID | Scenario | Expected result |
|---|---|---|
| T1 | Register with valid details (avatar optional) | Account is created and the user is logged in |
| T2 | Login with wrong password | `401` with a clear error; no token issued |
| T3 | Creator uploads a video with `videoFile` + `thumbnail` | Video appears in the feed and on the channel page |
| T4 | Viewer opens a video | It plays, view count increments, related videos load |
| T5 | Viewer likes a video, comments, then subscribes to the channel | Counts/state update immediately and persist after refresh |
| T6 | Signed-out user calls a protected endpoint (`/users/current-user`, `/dashboard/stats`) | Rejected with `401` |
| T7 | Non-owner tries to edit/delete another user's video or comment | Access denied (`403`) |
| T8 | Upload with a missing file or empty `title` | Validation error returned; no partial record saved |
| T9 | Access token expires, then a request is made | Refresh flow issues a new token, or the interceptor clears auth and redirects to `/login` |
| T10 | Cloudinary or MongoDB fails during a save | UI shows an error toast and does not claim success |

## Before demo
- [ ] Complete the guest-browse → login → upload → watch → like → comment → subscribe workflow.
- [ ] Refresh and confirm saved data (video, comment, like, subscription, playlist) persists.
- [ ] Test one invalid input (empty title) and one unauthorized request (protected endpoint while signed out).
- [ ] Check loading, empty, and error states on home, search, history, and dashboard.
- [ ] Verify the deployed frontend's `VITE_API_BASE_URL` points at the deployed backend.
- [ ] Confirm no `.env` secrets or Cloudinary/JWT keys are committed.
- [ ] Run `npm run lint` and `npm run build` in `frontend/`.

## Known limitations
Document untested features honestly. Do not claim production readiness based on this checklist.

Known gaps at time of writing:
- Comment-like and tweet-like routes are not mounted; do not test or demo them.
- There is no automated end-to-end suite (Playwright is on the roadmap).
- Video encoding/adaptive streaming is not covered — only direct Cloudinary delivery.

---

## Reusable prompt

```text
Create a short, risk-focused test plan from the SRD, API contract, data model, and implemented code.
Include 5–8 specific scenarios with expected results, at least one invalid-input case, one authorization/security case, and a tiny pre-demo checklist.
Prioritize the main workflow and likely failure points. Exclude features outside the MVP.
Suggest only the smallest useful automated tests for the existing stack.
Never claim a test passed unless it was actually run and the result is known.
Output Markdown only.
Sources: [SRD PATH], [API CONTRACT PATH], [DATA MODEL PATH], [RELEVANT CODE PATHS]
```
