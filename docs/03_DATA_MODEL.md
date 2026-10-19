# Data Model: Vidora

> Shared field reference. Source of truth: Mongoose schemas in `backend/src/models/`. Add fields only when a feature needs them.

Database: MongoDB via Mongoose. Binary media lives in Cloudinary; these collections store metadata plus Cloudinary `url` / `public_id` pairs.

## `users`
| Field | Type | Notes |
|---|---|---|
| `username` | string | Required, unique, trimmed, lowercased |
| `email` | string | Required, unique, trimmed, lowercased |
| `password` | string | Optional for OAuth users; bcrypt-hashed (10 rounds) pre-save |
| `fullName` | string | Required, trimmed |
| `avatar` | `{ url, public_id }` | Cloudinary image; default empty strings |
| `coverImage` | `{ url, public_id }` | Cloudinary image; default empty strings |
| `WatchHistory` | ObjectId[] → `Video` | Videos watched by the user |
| `refreshToken` | string | Current refresh token (single active) |
| `authProvider` | enum `local` \| `github` \| `google` | Default `local` |
| `providerId` | string | OAuth provider user ID |
| `createdAt` / `updatedAt` | timestamp | From `timestamps: true` |

Indexes: unique `username`, unique `email`, unique sparse compound `{ authProvider, providerId }` (prevents duplicate OAuth accounts).
Methods: `isPasswordCorrect()`, `GenerateAccessToken()` (payload `_id, email, username, fullName`), `GenerateRefreshToken()` (payload `_id`).

## `videos`
| Field | Type | Notes |
|---|---|---|
| `videoFile` | `{ url, public_id }` | Required; Cloudinary video |
| `thumbnail` | `{ url, public_id }` | Cloudinary image; default empty |
| `title` | string | Required |
| `description` | string | Required |
| `duration` | number | Required; seconds (from Cloudinary) |
| `views` | number | Default `0` |
| `isPublished` | boolean | Default `true` (draft when `false`) |
| `owner` | ObjectId → `User` | Creator |
| `createdAt` / `updatedAt` | timestamp | From `timestamps: true` |

Plugin: `mongoose-aggregate-paginate-v2` (feeds the paginated listing/aggregations).

## `comments`
| Field | Type | Notes |
|---|---|---|
| `content` | string | Required |
| `owner` | ObjectId → `User` | Comment author |
| `video` | ObjectId → `Video` | Parent video |
| `createdAt` / `updatedAt` | timestamp | From `timestamps: true` |

Plugin: `mongoose-aggregate-paginate-v2` (paginated comment threads).

## `likes`
| Field | Type | Notes |
|---|---|---|
| `video` | ObjectId → `Video` | Liked video (one of the target fields is set) |
| `comment` | ObjectId → `Comment` | Reserved; comment likes not routed yet |
| `tweet` | ObjectId → `Tweet` | Reserved; no Tweet model exists yet |
| `likedBy` | ObjectId → `User` | Liker |
| `createdAt` / `updatedAt` | timestamp | From `timestamps: true` |

## `playlists`
| Field | Type | Notes |
|---|---|---|
| `name` | string | Required |
| `description` | string | Optional |
| `video` | ObjectId[] → `Video` | Ordered membership |
| `owner` | ObjectId → `User` | Playlist creator |
| `createdAt` / `updatedAt` | timestamp | From `timestamps: true` |

## `subscriptions`
| Field | Type | Notes |
|---|---|---|
| `subscriber` | ObjectId → `User` | Required; the follower |
| `channel` | ObjectId → `User` | Required; the followed creator |
| `createdAt` / `updatedAt` | timestamp | From `timestamps: true` |

## Rules
- Ownership checks happen in controllers: users may modify only their own videos, comments, and playlists; the server derives `owner`/`likedBy`/`subscriber` from the JWT, never from the request body.
- Server generates IDs and timestamps; validate required fields against the schema before writing.
- Deleting a video should also remove its Cloudinary assets and dependent comments/likes.
- Media field names are exact: `videoFile`, `thumbnail`, `avatar`, `coverImage` — the API contract and multipart uploads depend on them.

---

## Reusable prompt

```text
Create a compact data model from the SRD and API contract.
For each entity include field/type, required or allowed values, relationships, and important validation/access rules.
Match the API contract exactly and flag contradictions instead of guessing.
Avoid speculative fields and premature complexity; model only the MVP workflow.
Use the selected database's terminology when known.
Output Markdown only.
Sources: [SRD PATH], [API CONTRACT PATH], [DATABASE CHOICE]
```
