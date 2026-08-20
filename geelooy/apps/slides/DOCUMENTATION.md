<!-- B"H
Boruch Hashem
Blessed is He
The Awtsmoos renews understanding together with implementation; Awtsmoos.com leaves this map so the next creator can enter the presentation vessel without archaeology becoming guesswork.
-->
# Awtsmoos Slides

Awtsmoos Slides is a mobile-first presentation editor for Geelooy. It runs at `/apps/slides/` and as the `awtsmoosPresenter` program inside Geelooy OS.

## Fast authoring

- Create, select, duplicate, reorder, and delete slides.
- Insert headings, text, rectangles, circles, and local images.
- Drag elements with mouse or touch pointer input and snap to slide/peer edges and centers.
- Resize from four corner handles with larger coarse-pointer targets.
- Double-click text for direct editing and nudge selections with arrow keys.
- Copy, cut, paste, duplicate, delete, and change z-order through canonical store commands.
- Edit geometry, opacity, rotation, typography, colors, borders, and image fit.
- Apply Midnight, Dawn, Forest, Paper, and Neon presentation themes.
- Keep per-slide speaker notes outside the presented/exported canvas.
- Undo and redo history-aware mutations.

## Mobile command system

Below 900px the editor becomes a phone-native command surface instead of a squeezed desktop UI.

A safe-area-aware bottom command bar exposes four primary modes:

- `📚 Slides` opens the slide rail and shows a live current/total badge.
- `✨ Insert` opens a command sheet for Heading, Text, Rectangle, Circle, Image, New slide, and Duplicate slide.
- `🎨 Design` opens visual palette cards for all five real deck themes plus the full inspector.
- `⚡ More` exposes Speaker notes, Share, Present, Undo, Redo, Import, Awtslides download, and HTML export.

When an element is selected, a second contextual ribbon appears above the primary bar with labeled SVG commands for `🎨 Style`, Copy, Duplicate, `⇅ Arrange`, and Delete. Arrange opens a focused sheet containing front/forward/backward/back layering plus element operations.

The mobile command language is data-driven. Bars, sheets, and contextual controls share one action registry and one trusted inline SVG icon renderer. Emoji adds recognition and warmth but accessible labels remain authoritative.

Only one command sheet is open at a time. Sheets dismiss by backdrop, close button, or Escape, close after real commands execute, and disappear entirely in presentation mode.

The stage dynamically reserves bottom space: the primary bar never covers footer/notes, and extra space is added only while the contextual element dock exists. Off-canvas panels, command sheets, and fixed mobile chrome preserve a 390px document width with no horizontal page overflow.

## Direct interaction integrity

Pointer cancellation and window blur terminate drags and clear snap guides. Pointer capture is attempted safely, so real input still captures normally while synthetic/automation pointers that are not browser-owned cannot throw a `NotFoundError`.

Slide-order arrows disable at deck boundaries. Mobile panels remain mutually exclusive. Resize handles enlarge for coarse pointers and speaker notes stay collapsed until requested.

## Presentation mode

Presentation mode includes visible touch controls plus keyboard navigation:

- Previous and Next buttons.
- Current slide position.
- Explicit Exit button.
- Horizontal swipe navigation.
- Arrow, Page Up/Page Down, Space, and Escape keyboard handling.
- Boundary-aware disabled controls at the first and final slides.

All authoring chrome—including the mobile command bar, contextual dock, and command sheet—is suppressed while presenting.

## Speaker notes integrity

Pending note edits are bound to the slide on which they were typed, not whichever slide happens to be active when a debounce fires. Pending notes flush on blur, page hide, visibility loss, and slide transitions through targeted slide updates.

## Persistence and portability

- Room-scoped localStorage autosave.
- Versioned `.awtslides` JSON import/export.
- Hardened import normalization for fields, enums, colors, image schemes, geometry, typography, and payload sizes.
- Dependency-free HTML export with escaped user text, keyboard playback, and swipe navigation.
- Theme colors resolve into canonical slide/element data, so exported HTML has no runtime theme dependency.
- Speaker notes remain in deck JSON but never enter slide rendering or standalone HTML output.

## Collaboration

Rooms use channels shaped as `slides:<room-id>`. The app reuses the existing Geelooy page-presence WebSocket. Generic `SOCIAL_PUBLISH` messages carry `slides.sync.request` and `slides.sync` events through the existing `SOCIAL_EVENT` path.

Messages include protocol version and per-tab client ID. Echoes are ignored and older revisions cannot overwrite newer local state. Synchronization is last-revision-wins snapshots rather than character-level CRDT merging.

Connectivity labels remain literal: `Connecting`, `Live · N`, `Reconnecting`, or `Offline`.

## Architecture

- `src/model/` — document factories, themes, sanitization, and normalization.
- `src/state/` — canonical deck state, history, slide lifecycle/order, targeted slide updates, and element mutations.
- `src/render/` — stage, thumbnails, selection handles, snap guides, and passive presentation rendering.
- `src/ui/icons/` — trusted dependency-free inline SVG icon renderer.
- `src/ui/menus/` — shared action registry plus command-sheet renderer/controller.
- `src/ui/` — panels, inspector, drag, text editing, resize, keyboard, clipboard, mobile command bar/dock, notes, themes, slide-order state, and playback.
- `src/persistence/` — room-scoped local drafts plus `.awtslides` transfer.
- `src/export/` — standalone HTML generation and its self-contained player assets.
- `src/collab/` — collaboration policy and adapter to existing presence transport.
- `geelooy/os/programs/awtsmoos-presenter/` — thin OS host for the same standalone app.

## Verification

The focused suite currently contains **33 passing tests with 0 failures**. Coverage includes document normalization/security, notes, targeted slide updates, slide ordering, element mutation/z-order, HTML export escaping, collaboration envelopes, resize geometry, theme resolution, snapping, presenter navigation, and the new mobile action registry/theme-sheet mapping.

Runtime syntax checks pass for the final mobile dock, command sheet controller, app assembly, and pointer interaction controller. The architecture audit reports **no Slides JS, MJS, CSS, or HTML file above 120 lines**.

Real browser verification is now performed in an isolated temporary Chrome profile on debugging port 9223, separate from the user's normal Chrome session. Cache-disabled 390×844 tests verify:

- `clientWidth = scrollWidth = 390`.
- Four SVG-backed mobile primary commands.
- Seven Insert actions.
- Five real Design themes and palette swatches.
- Five labeled contextual element actions.
- Four Arrange layering controls.
- More/File access to notes, sharing, presenting, history, import, Awtslides, and HTML.
- Dawn theme application resolves to `rgb(255, 248, 237)`.
- Presentation suppresses mobile command bar, contextual dock, and command sheet.
- No runtime exceptions during the cache-disabled mobile flow.
- Primary bar does not overlap footer or notes.
- Selected-element dock does not overlap footer or notes.
- No horizontal page overflow.

## Deliberate boundaries

- Binary PPTX import/export is not implemented.
- Collaboration is snapshot/revision based, not CRDT character merging.
- Drive-backed persistence is intentionally not coupled into this app because unrelated in-progress Drive work already exists in the repository.
- Shared OS registry files contain unrelated Awtsmoos Sheets registrations; Slides work preserves them rather than cleaning them up.
