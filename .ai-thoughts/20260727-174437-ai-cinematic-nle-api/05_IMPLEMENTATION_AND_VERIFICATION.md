B"H
Boruch Hashem
Blessed is He

# AI-Cinematic NLE Implementation and Verification

The Awtsmoos gave one cinematic intention a human-readable brief, a complete
machine envelope, a canonical MitzvahWorld project, and a living NLE state.

## Complete Cinematic Starter

Fresh editor loads begin with `One Quiet Light — Cinematic AI Starter` unless an
existing local autosave or explicit `movieUrl` already supplies a project.

- Duration: 18 seconds.
- Frame rate: 24 FPS.
- Resolution: 1920 × 1080.
- Tracks: 8.
- Generated assets: 8.
- Scenes: 3.
- Camera shots: 5.
- Actor movement, poses, dialogue, score tones, gradients, particles, title
  overlays, scene grades, and deterministic seeds are present.
- Existing raw movie JSON and saved projects remain supported.

## AI Movie Envelope

- Schema ID: `awtsmoos.ai-movie.v1`.
- Schema path: `reel-studio/api/ai-movie-schema-v1.json`.
- Starter path: `reel-studio/projects/hyperreal-cinematic-starter.json`.
- Required fields: `schema`, `creativeBrief`, and `project`.
- The canonical MitzvahWorld movie remains nested under `project`.
- The brief includes logline, subject, world, visual language, camera, lighting,
  continuity, sound, requested assets, and negative constraints.

The envelope tells another AI to return one complete document rather than prose or
a partial patch. External image, video, voice, and music assets must be requested
explicitly and are never falsely claimed to exist.

## Safe Import and Apply

- Raw canonical project JSON and AI envelopes are accepted.
- Input strings are bounded to 262,144 bytes.
- Unsupported schema identifiers are rejected.
- Canonical normalization and strict validation run before state mutation.
- NLE assets are bounded and require `id` and `kind`.
- Applied documents enter through one undoable `state.replace` operation.
- Exported envelopes are deep clones and cannot mutate editor state.
- Autosave, project download, movie download, and 3D World remain intact.

## In-Editor AI Movie Workspace

The topbar now includes **AI Movie**. Its responsive workspace provides:

- Creative brief and complete JSON tabs.
- Load cinematic starter.
- Export current project into the AI envelope.
- Copy JSON Schema or complete JSON.
- Download the complete AI movie envelope.
- Validate and apply returned JSON.
- Plain success and validation-error status.

Desktop uses a centered cinematic dialog. Mobile uses an exact full-screen,
safe-area-aware chamber with independently scrolling brief and JSON content.

## Public API

`globalThis.AwtsmoosMovie.ai` is frozen and exposes:

- `schema`
- `schemaUrl`
- `starterUrl`
- `help`
- `loadSchema()`
- `loadStarter()`
- `export()`
- `apply(source)`

Existing playback, seek, recorder, render, project, runtime, and 3D World API
properties remain present.

## Browser Proof

Desktop 1440 × 1000 and mobile 390 × 844 both verified:

- Cinematic starter loaded with all expected tracks and assets.
- Canvas rendered at 1920 × 1080 with non-flat sampled pixels.
- Timeline remained visible with no document overflow.
- JSON Schema loaded through the public API.
- Brief showed the full logline, four continuity rules, and four asset requests.
- Complete JSON changed the title to `AI Revised Cinematic Scene`.
- Undo restored the original title and redo remained available.
- Starter restoration returned the original complete movie.
- Render API remained callable.
- Mobile AI workspace measured exactly 390 × 844 at x0/y0.
- Browser exceptions and console errors: none.

Screenshots and proof JSON are stored in this planning folder.

## Automated Gates

- 38 focused NLE, Reel, AI contract, CSS, timeline, and recorder tests passed.
- 22 canonical MitzvahWorld movie tests passed.
- CSS quality, social content, and profile-menu simulation passed.
- JSON parsing, JavaScript syntax, and scoped diff hygiene passed.
- Every touched source, style, and test owner remains at or below 120 lines.
- Complete code, JSON, style, host, test, and browser-proof rereads passed with checksums.

No MitzvahWorld gameplay source was modified. All changes remain uncommitted.
