# B"H

Boruch Hashem

Blessed is He

# Social Route Phase Three — Final Write Map

The Awtsmoos reveals the existing `/social/` route without creating a substitute application.

## Files to rewrite

- `social/index.html`
  - Add blessing header, theme metadata, versioned assets, and route body class.
- `style/social/hub/index.css`
  - Become the canonical focused manifest.
- `style/social/hub/tokens.css`
- `style/social/hub/shell.css`
- `style/social/hub/rail.css`
- `style/social/hub/hero.css`
- `style/social/hub/forms.css`
- `style/social/hub/cards.css`
- `style/social/hub/responsive.css`
- `style/social/live/presence.css`
- `scripts/awtsmoos/social/hub/renderConfig.js`
- `scripts/awtsmoos/social/hub/renderMarkup.js`
- `scripts/awtsmoos/social/hub/render.js`
- `scripts/awtsmoos/social/hub/index.js`

## Exact behavior retained

- All eleven existing hub tabs.
- Alias, target alias, Heichel, series, and search/live text fields.
- Existing result keys, API paths, WebSocket connection, publish action, Mail link, and page presence.
- Existing initial Overview execution.

## Exact improvements required

- Read-only initial calls run concurrently.
- Fields are 48 pixels high with owned dark backgrounds and persistent labels.
- Navigation and run actions are at least 44 pixels high.
- The mobile document width equals the viewport.
- Result JSON wraps and scrolls inside its card.
- Event handling is delegated once at the root.
- Busy and error information is announced without replacing the entire page.
- No production file exceeds 120 lines.

## Verification

1. JavaScript syntax checks.
2. CSS import resolution.
3. `/social/` at 320×568, 390×844, 768×1024, and 1440×1000.
4. Computed plain-control audit equals zero.
5. Undersized visible-control audit equals zero.
6. Horizontal overflow equals zero.
7. Console and network receipts contain no new unexpected failures.
