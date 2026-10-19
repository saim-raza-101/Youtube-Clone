# Vidora UI Registry

This is a living index of reusable UI patterns. Check it before adding a component and update it after a finalized feature is implemented.

## Existing Families

- `components/ui/`: Avatar, Badge, Button, Card, ConfirmDialog, Input, Modal, Skeleton, Spinner, Textarea, Toast, UploadProgressBar.
- `components/layout/`: Navbar, Header, Sidebar, SidebarItem, SearchBar, NavActions, UserDropdown, Footer.
- `components/common/`: AppLoader, EmptyState, ErrorBoundary, ErrorState, MediaPlaceholder, StatsCard, SubscribeButton, CategoryChip.
- `components/video/`: VideoCard, VideoGrid, VideoCardSkeleton, ChannelInfo, DurationBadge, EditVideoForm, ThumbnailUploader.
- `components/videoPlayer/`: VideoHeader, VideoSection, VideoActions, VideoDescription, RelatedVideos, ChannelCard, PlaylistDropdown, player comments.
- `components/channel/`: ChannelHeader, ChannelTabs, ChannelVideos, ChannelPlaylists.
- `components/comments/`: CommentForm, CommentItem, CommentSection.
- `components/upload/`: UploadForm, MediaUploadDropzones, VisibilitySettings.
- `components/profile/`: ProfileHeader, ProfileSettingsForm, ProfileStats.
- `components/playlist/`, `components/subscriptions/`, and `components/likedVideos/`: feature-specific collection and state views.

## Registry Entry Format

For new patterns record:

```text
### Component name
- Path:
- Purpose:
- Reused by:
- Important variants/tokens:
```
