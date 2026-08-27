B"H
Boruch Hashem
Blessed is He

# Awtsmoos Slides

Awtsmoos Slides is a mobile-first presentation editor for Geelooy. It runs at `/apps/slides/` and as `awtsmoosPresenter` inside Geelooy OS. The Awtsmoos renews every visible slide while Awtsmoos.com keeps editing, presentation, persistence, collaboration, and export as inspectable vessels.

## Authoring

- Create, select, duplicate, reorder, and delete slides.
- Insert headings, text, rectangles, circles, and local images.
- Drag with mouse/touch pointer input and snap to slide/peer edges and centers.
- Resize from corner handles with coarse-pointer targets.
- Double-click text for direct editing and nudge selections with arrow keys.
- Copy, cut, paste, duplicate, delete, and change z-order through store commands.
- Edit geometry, opacity, rotation, typography, colors, borders, and image fit.
- Apply Midnight, Dawn, Forest, Paper, and Neon themes.
- Keep per-slide speaker notes outside presented/exported canvas.
- Undo and redo history-aware mutations.

## Mobile command system

Below 900px the editor becomes a phone-native command surface. A safe-area-aware bottom bar exposes `Slides`, `Insert`, `Design`, and `More`. Selected elements gain a contextual ribbon for Style, Copy, Duplicate, Arrange, and Delete. Arrange exposes front/forward/backward/back layering.

Bars and sheets share one action registry and trusted inline SVG icon renderer. Only one command sheet opens at a time; backdrop, close button, Escape, and successful commands dismiss it. Presentation mode suppresses all authoring chrome.

The stage reserves bottom space for fixed mobile chrome. Panels and sheets preserve a 390px document width without horizontal overflow.

## Direct interaction integrity

Pointer cancellation and window blur terminate drags and clear snap guides. Pointer capture is attempted safely, so synthetic pointers cannot throw browser-owned capture errors. Slide-order arrows disable at deck boundaries, panels stay mutually exclusive, resize handles enlarge for coarse pointers, and notes stay collapsed until requested.

## Presentation mode

Presentation includes Previous/Next, slide position, Exit, swipe navigation, and keyboard support for arrows, Page Up/Down, Space, and Escape. Boundary controls disable on first/final slides.

## Speaker notes

Pending notes remain bound to the slide where they were typed. They flush on blur, page hide, visibility loss, and slide transitions through targeted slide updates. Notes remain in deck JSON but never enter rendered slides or standalone HTML output.

## Persistence and portability

- Room-scoped localStorage autosave.
- Versioned `.awtslides` JSON import/export.
- Hardened import normalization for enums, colors, image schemes, geometry, typography, and payload sizes.
- Dependency-free HTML export with escaped user text, keyboard playback, and swipe navigation.
- Theme colors resolve into canonical slide/element data so exported HTML has no runtime theme dependency.

## Collaboration

Rooms use `slides:<room-id>`. The app reuses the Geelooy page-presence WebSocket. `SOCIAL_PUBLISH` carries `slides.sync.request` and `slides.sync` through the existing `SOCIAL_EVENT` path. Messages include protocol version and per-tab client ID; echoes are ignored and older revisions cannot overwrite newer local state. Synchronization is last-revision-wins snapshots, not character-level CRDT merging.

Connectivity labels remain literal: `Connecting`, `Live · N`, `Reconnecting`, or `Offline`.

## Architecture

- `src/model/` — document factories, themes, sanitization, normalization.
- `src/state/` — deck state, history, slide lifecycle/order, targeted updates, element mutations.
- `src/render/` — stage, thumbnails, selection handles, snap guides, presentation rendering.
- `src/ui/icons/` — dependency-free inline SVG icons.
- `src/ui/menus/` — shared action registry and command-sheet controller.
- `src/ui/` — panels, inspector, drag/text/resize/keyboard/clipboard/mobile/notes/themes/playback.
- `src/persistence/` — local drafts and `.awtslides` transfer.
- `src/export/` — standalone HTML generation/player assets.
- `src/collab/` — collaboration policy and presence adapter.
- `geelooy/os/programs/awtsmoos-presenter/` — thin OS host for the same app.

## Verification

The focused suite documents 33 passing tests covering normalization/security, notes, targeted slide updates, ordering, element mutation/z-order, HTML escaping, collaboration envelopes, resize geometry, theme resolution, snapping, presenter navigation, and mobile command/theme mapping.

Browser verification uses an isolated Chrome profile at 390×844 and checks width/overflow, mobile commands, Insert/Design/Arrange/More actions, Dawn theme rendering, presentation chrome suppression, footer/notes overlap, and runtime exceptions.

The architecture audit keeps Slides JS, MJS, CSS, HTML, and this handoff under the 120-line source/document ceiling.

## Deliberate boundaries

- Binary PPTX import/export is not implemented.
- Collaboration is snapshot/revision based, not CRDT character merging.
- Drive-backed persistence is intentionally decoupled from Slides.
- Shared OS registry files may contain unrelated application registrations and should not be cleaned up as part of Slides work.
