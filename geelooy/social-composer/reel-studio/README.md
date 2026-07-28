B"H
Boruch Hashem
Blessed is He

# MitzvahWorld Reel Studio

This folder contains the project-first social NLE, cinematic WebGL preview, local
WebM recorder, complete movie packages, AI exchange contract, and optional full
MitzvahWorld world handoff.

## Fresh Default

A clean browser session loads **The Village Awakens — Cinematic World**:

- 24 seconds at 24 FPS and 1920 × 1080.
- Eleven houses, sixty-four trees, three paths, and four lamps.
- One walking lead character with a stable path.
- Five canonical camera-rig clips.
- Seven material graphs.
- One atmosphere shader graph and two GPU particle graphs.
- Dialogue, score tones, titles, scene grades, and render metadata.

A saved local project or explicit `movieUrl` overrides the starter.

## Public Surfaces

```js
const movie = globalThis.AwtsmoosMovie;

movie.actions.list();
await movie.actions.loadCinematicVillage();
await movie.actions.addHouse({ x: 5, z: -4, width: 12, height: 8 });
await movie.actions.addTreeGrove({ count: 20, centerX: 10, centerZ: 5 });
await movie.actions.animateCharacter({ start: 3, duration: 6, toX: 20, toZ: -18 });
await movie.actions.addCameraShot({ rig: 'craneReveal', start: 18, duration: 6 });
await movie.actions.addMaterialGraph({ label: 'Copper roof', color: '#8b563d' });
await movie.actions.addShaderGraph({ label: 'Evening atmosphere' });
await movie.actions.addParticleGraph({ mode: 'fireflies', count: 300 });
```

Every method above has one visible card under **AI Movie → Actions**. Both paths use
the same catalog and executor.

## Formats

- AI envelope: `awtsmoos.ai-movie.v1`
- Agent request: `awtsmoos.movie-request.v1`
- Complete movie package: `awtsmoos.movie-package.v1`
- Package schema: `api/movie-package-schema-v1.json`
- Example package: `projects/cinematic-village-package.json`

## Rendering Truth

The procedural village uses WebGL when available. The frame is composited into the
same 2D canvas used by preview, playback, MediaRecorder, and social attachment.
WebGL loss falls back to a deterministic 2D rendering of the same frame data.

This runtime produces an editable procedural cinematic world. External photoreal
characters, voices, music, images, or video require real supplied/generated assets.

## Documentation

- `docs/API_UI_PARITY.md`
- `docs/MOVIE_PACKAGE_FORMAT.md`
- `docs/CINEMATIC_WORLD_FORMAT.md`
- `docs/NODE_GRAPH_FORMATS.md`
- `docs/AGENT_PROVIDER_ADAPTER.md`
- `docs/ADDING_A_MOVIE_ACTION.md`
