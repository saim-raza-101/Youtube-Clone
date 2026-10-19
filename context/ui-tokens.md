# Vidora UI Tokens

The canonical token implementation is `frontend/src/styles/globals.css`. Use its CSS variables through Tailwind utilities instead of adding one-off hex values.

## Core Palette

- Backgrounds: `background`, `surface-low`, `surface`, `surface-elevated`
- Text: `text-primary`, `text-secondary`, `text-tertiary`, `text-muted`
- Borders: `border-subtle`, `border-default`, `border-light`
- Accent: Vidora rose/crimson tokens beginning with `accent`
- Semantic states: `success`, `warning`, `danger`, `info`
- Media overlays: `scrim`, `scrim-soft`, `scrim-strong`

The light theme overrides the same variables through `[data-theme="light"]`. New components must work with both themes.

## Typography

- Primary font: Inter.
- Display and body text use the existing `font-sans`/`font-display` tokens.
- Use hierarchy through size, weight, muted text, and spacing rather than new colors.

## Surfaces and Shape

- Use existing surface and elevated-surface tokens for cards, panels, menus, and dialogs.
- Use existing `sm`, `md`, `lg`, and `xl` radius tokens.
- Use `shadow-card`, `shadow-dropdown`, `shadow-modal`, and `shadow-glow` where the component pattern calls for them.

## Interaction

- Accent is reserved for primary actions, active navigation, likes/subscriptions, focus emphasis, and important status.
- `success`, `warning`, and `danger` communicate state, not decoration.
- Hover and focus states should use existing overlay/border/accent tokens.

## Responsive Guidance

- Prefer fluid grids and existing container utilities.
- Preserve thumbnail aspect ratios.
- Collapse side navigation and multi-column layouts at existing responsive breakpoints.
- Test narrow mobile widths and a wide desktop viewport for each new surface.
