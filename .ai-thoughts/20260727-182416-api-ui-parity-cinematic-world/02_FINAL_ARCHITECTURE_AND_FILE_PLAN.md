B"H
Boruch Hashem
Blessed is He

# Final Architecture and File Plan

## Action Parity

- `NleMovieActionCatalog.js`: serializable action definitions and fields.
- `NleMovieActionExecutor.js`: bounded action implementation.
- `NleMovieActionApi.js`: generated convenience methods plus `list` and `invoke`.
- `NleMovieActionPanel.js`: UI generated from the same catalog.
- `NleMovieActionMarkup.js`: accessible action card markup.
- `NleMovieActionParity.js`: runtime and test validation.

## Cinematic Factory and Packages

- `NleCinematicVillageFactory.js`: complete project/world/track composition.
- `NleCinematicVillageLayout.js`: deterministic houses, trees, paths, character.
- `NleCinematicGraphFactory.js`: material, shader, and particle graphs.
- `NleMovieAgentRequest.js`: provider-neutral request package.
- `NleMoviePackage.js`: complete package export and validation report.
- `api/movie-package-schema-v1.json`: ready-to-go package schema.
- `projects/cinematic-village-package.json`: complete example package.

## WebGL Runtime

- `NleWebGlMath.js`: perspective, look-at, matrix multiplication.
- `NleWebGlProgram.js`: shader compilation and buffer helpers.
- `NleWebGlGeometry.js`: boxes, roofs, trunks, crowns, paths, character geometry.
- `NleWebGlSceneData.js`: world vertices and moving character frame.
- `NleWebGlParticles.js`: GPU points from particle graph settings.
- `NleWebGlWorldRenderer.js`: context lifecycle, drawing, material cache, fallback.
- `NleCinematicFallbackRenderer.js`: deterministic 2D world fallback.

## Existing Rewrites

- `NleCompositor.js`: dispatch cinematic-world clips through WebGL renderer.
- `NleVisualRenderer.js`: preserve existing kinds and reject unknown ones safely.
- `NleAiStudioMarkup.js`: add Actions tab and action panel mount.
- `NleAiStudio.js`: own action panel and agent/provider status.
- `NleAiPublicApi.js`: expose generated action API and request/package helpers.
- `NlePublicApi.js`: expose `actions` and preserve legacy API.
- `NleApp.js`: construct executor/panel and pass renderer dependencies.
- `NleAppRender.js`: refresh action panel status after structural changes.
- `NleProjectDefaults.js`: preserve complete cinematic-world tracks.
- starter JSON: replace atmosphere-only default with village package project.

## Styles and Documentation

- `styles/action-panel.css` and `action-panel-mobile.css`.
- Bump NLE cache graph to `social-nle-004`.
- `reel-studio/README.md`.
- `reel-studio/docs/API_UI_PARITY.md`.
- `reel-studio/docs/MOVIE_PACKAGE_FORMAT.md`.
- `reel-studio/docs/CINEMATIC_WORLD_FORMAT.md`.
- `reel-studio/docs/NODE_GRAPH_FORMATS.md`.
- `reel-studio/docs/AGENT_PROVIDER_ADAPTER.md`.
