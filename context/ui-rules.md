# Vidora UI Rules

## Visual Direction

Vidora uses a premium, dark-first video platform interface with a muted light theme option. The visual language is calm, content-first, responsive, and consistent across feed, playback, creator, and account surfaces.

## Layout

- Global shell: top navbar plus collapsible sidebar on authenticated/content pages.
- Keep content inside a centered responsive container; avoid horizontal overflow.
- Use consistent spacing and clear visual hierarchy.
- Video cards preserve media aspect ratios and use deliberate truncation for long titles.
- Mobile layouts must collapse navigation and grids without hiding core actions.

## Components

- Reuse `components/ui/` primitives before creating a new control.
- Reuse `VideoCard`, `ChannelCard`, `CommentSection`, `EmptyState`, `ErrorState`, `Skeleton`, and shared layout components where applicable.
- One meaningful responsibility per component.
- Feature-specific components belong in their existing domain folder.
- Add a new pattern to `ui-registry.md` only after it is implemented and verified.

## States

Every async or data-driven surface should account for:

- Loading/skeleton
- Empty result
- Recoverable error
- Success feedback where a mutation occurs
- Auth-required state where appropriate

Never show raw backend/provider errors directly to users.

## Motion

- Use Framer Motion for short fade, slide, scale, and stagger transitions.
- Prefer ease-out motion; avoid bounce, elastic, flash, heavy rotation, and distracting parallax.
- Keep animations lightweight and clean up timers/listeners.
- Respect `prefers-reduced-motion`.

## Accessibility

- Use semantic HTML and associated labels.
- Provide meaningful `alt` text or mark decorative images appropriately.
- Maintain visible focus and adequate contrast in both themes.
- Buttons and links must be keyboard reachable and have clear text or ARIA labels.

## Do Not

- Do not redesign approved work without an explicit feature decision.
- Do not change backend behavior in a UI-only task.
- Do not duplicate API calls or data-fetching logic in components.
- Do not introduce arbitrary colors outside the semantic tokens.
- Do not remove existing loading, error, empty, validation, or notification states.
