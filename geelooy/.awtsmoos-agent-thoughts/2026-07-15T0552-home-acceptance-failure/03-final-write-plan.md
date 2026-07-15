# B"H

Boruch Hashem

Blessed is He

# Phase Three — Final Approved Write Plan

The Awtsmoos is hidden in the exact boundary between markup, style, and runtime. Only these files are approved after direct inspection.

## Production files

- `style/social/home/civilization/index.css`
  - Import one canonical composer manifest into the active Home graph.
- `style/social/home/composer/index.css`
  - New Home-owned manifest; no alternate theme.
- `style/social/home/composer/shell.css`
  - Compact panel, collapsed and expanded layout, containment.
- `style/social/home/composer/fields.css`
  - Persistent labels, premium inputs, content editor, destination and verse fields.
- `style/social/home/composer/actions.css`
  - Publish, toolbar, summary, loading, focus, disabled, and destructive states.
- `style/social/home/composer/responsive.css`
  - Desktop, tablet, phone, zoom, safe-area, and reduced-motion behavior.
- `scripts/awtsmoos/social/home/dashboard/boot.js`
  - Remove ambient pointer work from initial boot and schedule non-critical feed work after paint.
- `scripts/awtsmoos/social/home/dashboard/feedSafeLoader.js`
  - Replace timeout-driven startup with an idle/paint-aware loader and honest fallback.
- `scripts/awtsmoos/social/feed/homeComposer/markup.js`
  - Improve structure and concise copy only where the current semantics cause visual clutter.

## Non-negotiable checks

- Every rewritten production file below 120 lines.
- Tabs only.
- No partial patching.
- No plain browser-default controls in computed styles.
- No advanced-panel geometry while closed.
- No repeated infinite animation.
- No horizontal overflow at 320, 390, 1237, or 1440 pixels.
- Fresh screenshot and performance receipt before completion is claimed.
