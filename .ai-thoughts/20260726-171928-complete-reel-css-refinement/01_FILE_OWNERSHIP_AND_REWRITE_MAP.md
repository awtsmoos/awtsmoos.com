B"H
Boruch Hashem
Blessed is He

# File Ownership and Rewrite Map

## Shared NLE Foundation

- `nle/styles/tokens.css`
  - Shared custom properties for colors, typography, radii, spacing, shadows, motion, and control heights.
- `nle/styles/a11y.css`
  - Focus-visible, reduced-motion, forced-colors, coarse-pointer, and selection behavior.
- `nle/styles/index.css`
  - Import order only.

## NLE Shell

- `shell-layout.css`
  - Studio grid, topbar, brand, workspace, panel surfaces, panel headings.
- `shell-controls.css`
  - Buttons, project title, action grouping, common controls.
- `shell-status.css`
  - Status bar, progress, diagnostics, error state.

## NLE Preview

- `preview.css`
  - Preview panel, cinema stage, canvas frame, badge, loading/fatal states.
- `transport.css`
  - Transport buttons, scrubber, output.

## NLE Assets

- `asset-generators.css`
  - Generator grid, type medallions, title generator, import control.
- `asset-library.css`
  - Asset cards, metadata, thumbnails, insert action, hover/selected states.

## NLE Inspector

- `inspector.css`
  - Inspector panel, project/clip fields, notes, receipts, field grouping.

## NLE Timeline

- `timeline-shell.css`
  - Panel, toolbar, time readout, zoom, scroll container, ruler.
- `timeline-tracks.css`
  - Track rows, sticky labels, family accents, alternating surfaces.
- `timeline-clips.css`
  - Clip families, selection, trim handles, playhead, hover/focus.

## NLE Mobile

- `mobile-shell.css`
  - Topbar, title, action strip, mode tabs, status.
- `mobile-workspace.css`
  - Pane switching and pane scrolling.
- `mobile-timeline.css`
  - Toolbar wrapping, labels, clip/handle geometry, ruler/playhead offsets.

## Parent Reel Surface

- `reel/tokens.css`
  - Parent Reel variables aligned to the NLE palette.
- `reel/card.css`
  - Composer Reel feature card.
- `reel/dialog-shell.css`
  - Dialog, header, close/back controls, content, footer.
- `reel/choices.css`
  - Upload/Create choice cards.
- `reel/studio.css`
  - Embedded iframe stage, status, progress, render actions.
- `reel/mobile.css`
  - Full-screen mobile dialog and touch layout.
- `reel/index.css`
  - Import order only.

## Tests

- Add a CSS contract test for token imports, focus states, reduced motion, coarse pointer support, parent/NLE visual ownership, and line ceilings.
- Preserve all existing CSS quality tests.

## No Logic Changes

- No JavaScript behavior changes are planned.
- No MitzvahWorld source files are touched.
- Existing semantic class names remain stable.
