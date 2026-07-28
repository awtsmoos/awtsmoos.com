B"H
Boruch Hashem
Blessed is He

# Exact File Plan

## Static Contracts

- `reel-studio/api/ai-movie-schema-v1.json`
  - JSON Schema for the AI envelope and core project requirements.
- `reel-studio/projects/hyperreal-cinematic-starter.json`
  - Complete deterministic starter with creative brief and canonical project.

## New NLE Modules

- `NleAiContract.js`
  - URLs, schema identifier, limits, envelope guards, cloned export.
- `NleAiProjectCodec.js`
  - Parse, normalize, strict validate, envelope extraction, starter loading.
- `NleAiStudioMarkup.js`
  - Safe dialog markup and brief summary rendering.
- `NleAiStudio.js`
  - Bind buttons, copy/download/apply/reset, render current envelope.
- `NleAiPublicApi.js`
  - Build the frozen `AwtsmoosMovie.ai` contract.

## Rewritten Existing Modules

- `NleProjectIO.js`
  - New default starter URL and AI-aware file import.
- `NleProjectDefaults.js`
  - Preserve supplied complete NLE tracks and normalize AI metadata.
- `NleShell.js`
  - Add AI Movie button and dialog mount point.
- `NleApp.js`
  - Construct AI studio and expose it to rendering/API.
- `NleAppEvents.js`
  - Open AI dialog from the topbar.
- `NlePublicApi.js`
  - Add frozen AI contract while preserving every existing property.
- `NleAppRender.js`
  - Refresh AI workspace after structural project changes.

## Styles

- `styles/ai-studio.css`
  - Dialog shell, tabs, brief, JSON editor, actions, status.
- `styles/ai-studio-mobile.css`
  - Full-screen mobile workspace and safe-area controls.
- `styles/index.css`
  - Import the two new owners with a new cache version.

## Tests

- `tests/nleAiMovieContract.test.mjs`
  - Schema/example/codec/public UI contracts.
- Re-run all NLE, Reel, MitzvahWorld movie, CSS, and social composer tests.
