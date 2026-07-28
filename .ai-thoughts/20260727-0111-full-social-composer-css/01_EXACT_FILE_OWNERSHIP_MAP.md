B"H
Boruch Hashem
Blessed is He

# Exact File Ownership Map

## Composer Foundation

- `styles/redesign/tokens.css`
  - Composer-scoped color, spacing, radius, shadow, control, motion, and semantic accents.
- `styles/redesign/accessibility.css`
  - Focus, reduced motion, forced colors, coarse pointers, selection, and scrollbars.
- `styles/redesign/index.css`
  - Import order and cache version only.

## Desktop Shell

- `shell.css`
  - Document, sticky header, title group, main layout, panel surfaces, preview column.
- `panel-headings.css`
  - Major panel summaries, kickers, open state, semantic accent rails.
- `forms.css`
  - Labels, inputs, textareas, selects, checkboxes, field grids, notices.
- `actions.css`
  - Shared buttons, primary, destructive, action bar, status messages, dialogs.
- `tools.css`
  - Section headings, metrics, inline creation, technical receipts, helper notes.

## Destination and Identity Overlays

- `identity-mobile.css`
  - Compact mobile alias identity row.
- `destination.css`
  - Destination results, selected summary, series browser, placements, creation groups.

## Publication and Preview

- `publication.css`
  - Checklist, plan/result receipts, visibility/schedule grouping, support note.
- `preview.css`
  - Reading sheet, preview header, post preview, stats, mobile preview state.
- `publication-mobile.css`
  - Fixed phone action gate and safe-area behavior.

## Mobile Composer

- `mobile.css`
  - Mobile header, layout order, panel edge treatment, writing-first geometry.
- `mobile-compact.css`
  - 320–368px adjustments.

## Structured Editor

- `structured/index.css`
  - Manifest only.
- `structured/controls.css`
  - Structured toolbar and section actions.
- `structured/sections.css`
  - Section/verse cards, headings, metadata, comments, timing.
- `structured/media.css`
  - Media cards, previews, captions, media actions.
- `structured/playlist.css`
  - Playlist selector/chips/receipts.
- `structured/mobile.css`
  - Mobile structured editor geometry.

## Playlist Sheet

- `structured/playlist-sheet.css`
  - Manifest only.
- `playlist-sheet-shell.css`
  - Dialog/sheet shell, header, search, footer.
- `playlist-sheet-rows.css`
  - Rows, hierarchy, selected state, create row.
- `playlist-sheet-mobile.css`
  - Full-screen mobile sheet and safe-area controls.

## Tests and Evidence

- Add a composer CSS system contract test.
- Preserve existing mobile, structured, playlist, destination, and publication tests.
- Capture desktop/mobile baseline before writing.
- Capture desktop/mobile final editor and preview after writing.

## Explicit Non-Goals

- No JavaScript behavior changes.
- No API or publication contract changes.
- No invented tags, warnings, or audience controls.
- No base civilization rewrite unless browser evidence proves an unavoidable conflict.
