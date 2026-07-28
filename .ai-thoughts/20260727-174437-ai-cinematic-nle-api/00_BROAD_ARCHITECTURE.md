B"H
Boruch Hashem
Blessed is He

# AI-Cinematic NLE: Broad Architecture

## Mission

Give the existing NLE a complete cinematic starter project and a truthful AI-facing
JSON contract so another AI can author, inspect, revise, and return a movie document
that the editor can safely load, preview, render, and open in MitzvahWorld.

## Existing Truth

- The NLE already edits one canonical MitzvahWorld movie document.
- The canonical project normalizer, validator, compiler, codec, and query loader exist.
- The NLE adds `project.nle.assets` and three extension tracks.
- Rendering, recording, timeline history, import/export, and 3D launch already work.
- The current public API exposes playback and rendering but not AI authoring helpers.
- The current default project is cinematic but has no machine-readable creative brief.

## Architecture

1. Add a static JSON Schema for an AI movie envelope.
2. Add a complete hyper-cinematic starter project as JSON.
3. Keep the canonical movie project nested under `project` in the envelope.
4. Add `creativeBrief` with logline, subject, environment, camera language, lighting,
   continuity, sound, asset requests, and explicit constraints.
5. Add a local codec that accepts either a raw project or the AI envelope.
6. Normalize and strictly validate before applying any imported AI document.
7. Keep unknown safe project fields so the canonical compiler remains extensible.
8. Add an in-editor AI Movie dialog with plain-language brief and JSON workspace.
9. Add buttons for starter, current export, schema copy, JSON copy, apply, and download.
10. Extend `AwtsmoosMovie.ai` with schema, example, export, apply, and starter helpers.
11. Make the starter the new default only when no saved local project exists.
12. Preserve the existing `movieUrl` override and project import workflow.
13. Never claim a remote AI generated media; the contract prepares assets and shots.
14. Keep every source and style owner below 120 lines.
