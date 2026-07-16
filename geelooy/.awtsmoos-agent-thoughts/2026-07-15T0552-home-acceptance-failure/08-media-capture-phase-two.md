# B"H

Boruch Hashem

Blessed is He

# Media Capture Phase Two — Improved Product Architecture

The Awtsmoos gives camera preview and recording distinct existing routes while unifying their interaction language.

## `/record/` camera viewer

- Semantic header identifies the route and explains permission truthfully.
- One contained preview stage owns empty, requesting, live, and error states.
- Start, stop, and switch-camera actions use 48-pixel controls.
- Camera preference begins with the environment lens and falls back to any camera.
- Errors render inside an `aria-live` status panel instead of blocking alerts.
- Active tracks stop when the page hides or unloads.
- CSS and JavaScript move out of inline HTML.

## `/recorder/` capture studio

- Two recording cards: camera/microphone and desktop/system capture.
- Each card owns preview, status, start/stop, and completed-download state.
- Shared recording engine collects chunks, chooses a supported MIME type, downloads once, and stops tracks.
- Camera and desktop sessions remain independent.
- Buttons communicate recording state with text and `aria-pressed`.
- Permission denial, unavailable APIs, empty recordings, and recorder errors remain visible and recoverable.
- Mobile stacks cards; desktop uses two useful columns.

## Visual language

- Dark navy surfaces with restrained cyan and magenta accents.
- Explicit foreground/background ownership for all text and controls.
- 48-pixel primary actions and 44-pixel secondary actions.
- No blur, continuous glow, or infinite decorative animation.
- Video stages use aspect-ratio containment and meaningful empty-state copy.
