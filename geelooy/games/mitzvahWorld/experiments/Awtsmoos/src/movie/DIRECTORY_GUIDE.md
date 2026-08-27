# B"H

Boruch Hashem. Blessed is He.

# Movie Maker Directory Guide

## Active entry and ownership

`MovieStudio.js` is the active editor composition. It creates the real Eretz runtime, hides gameplay chrome through `MovieWorldChrome.js`, creates `MovieStudioView.js`, installs `MovieStudioSession.js`, binds `MovieStudioInteractionController.js`, and returns the published `globalThis.AwtsmoosMovie` API.

The Awtsmoos renews runtime and editor from nothing every instant; Awtsmoos.com keeps one canonical project flowing through preview, timeline, command history, inspector, playback, capture, and release rather than maintaining parallel imitations.

## Studio shell and lifecycle

- `MovieStudioMarkup.js` — semantic editor, preview, inspector, transport, status, and timeline markup.
- `MovieStudioView.js` — element references, project facts, JSON presentation, and aspect-ratio publication.
- `MovieStudioSession.js` — canonical session, current time, playback, capture, and release.
- `MovieStudioProjectInstall.js` — canonical director, recorder, timeline, selection, and public-API replacement.
- `MovieStudioSessionActions.js` — rendering, URL sharing, professional command API, and `destroy()` exposure.
- `MovieStudioInteractionController.js` — removable controls and guarded keyboard routing.
- `MovieStudioKeyboard.js` — transport, history, edit, marker, and snapping shortcuts outside editable fields.
- `MovieInspectorState.js` — visible, ARIA, inert, and rendered focus state for the inspector.
- `MovieStudioLifecycle.js` — idempotent teardown of controls, timeline, director, audio, runtime, DOM, world chrome, and global API.
- `MovieWorldChrome.js` — reversible concealment of ordinary gameplay UI while editing.

## Reversible project commands

- `MovieStudioCommands.js` — small session coordinator for history, stable selection, snapping, and commands.
- `MovieStudioProjectCommands.js` — pure split, duplicate, delete, marker, and pre-edit project resolution.
- `MovieStudioCommandHistory.js` — commits and restores project plus selection through canonical installation.
- `MovieStudioEditTransactions.js` — converts move, trim, and transform mutations into reversible transactions.
- `MovieProjectHistory.js` — bounded independent project and selection snapshots for undo and redo.
- `MovieProjectSelection.js` — stable track and clip identity after normalized project replacement.
- `MovieClipCommands.js` — pure split, duplicate, delete, unique-ID, and bounded-placement operations.
- `MovieProjectMarkers.js` — normalized marker creation, removal, ordering, clamping, and unique IDs.
- `MovieTimelineSnapping.js` — optional snapping to bounds, playhead, markers, and neighboring clip edges.

Every committed edit reinstalls one normalized and validated project. DOM nodes and stale clip references never enter history.

## Studio styling

- `MovieStudioTokensCss.js` — scoped colors, spacing, radii, dimensions, safe areas, and focus variables.
- `MovieStudioLayoutCss.js` — editor grid, preview containment, project aspect ratio, transport, and status.
- `MovieStudioInspectorCss.js` — inspector sections and project/export controls.
- `MovieStudioControlsCss.js` — buttons, fields, focus, and control states.
- `MovieStudioResponsiveCss.js` — desktop panel, tablet drawer, mobile bottom sheet, and touch layouts.
- `MovieStudioLoadingCss.js` — boot progress and error presentation.
- `MovieStudioStyleText.js` — active scoped stylesheet composition.

## Timeline

- `MovieTimelineView.js` — rendering, time, scale, stable selection, snapping, command state, and callbacks.
- `MovieTimelineRenderer.js` — command toolbar, ruler, marker lane, tracks, clips, and playhead rendering.
- `MovieTimelineToolbar.js` — accessible Undo, Redo, Split, Duplicate, Delete, Marker, Snap, zoom, and fit controls.
- `MovieTimelineMarkers.js` — positioned accessible markers, click-to-seek, and keyboard removal.
- `MovieTimelineInteractionController.js` — scrub, Home/End, zoom keys, and modifier-wheel zoom.
- `MovieTimelineClipEditor.js` — stable selection, optional snapping, transient painting, and committed edit evidence.
- `MovieTimelineClipDrag.js` — pure gesture delta, move/trim, snapping, and clip painting.
- `MovieTimelineClipElement.js` — accessible clip DOM and trim handles.
- `MovieTimelineGeometry.js` — pure time, pixel, move, trim, and ruler calculations.
- `MovieTimelineViewport.js` — measured sticky-header geometry.
- `MovieTimelineZoomState.js` — pointer-centered zoom and scroll restoration.
- `MoviePointerCapture.js` — optional pointer-capture resilience.
- `MovieTimeline*Css.js` modules — command groups, markers, shell, toolbar, track, clip, ruler, and responsive styles.

## Professional command behavior

The active editor supports:

- bounded undo and redo with selection restoration;
- split selected clip at the playhead;
- duplicate selected clip with a unique ID and bounded placement;
- delete selected clip and recover it through undo;
- move and both trim edges as reversible edits;
- transform-inspector edits as reversible transactions;
- JSON project replacement as an undoable transaction;
- marker creation, visible marker lane, click-to-seek, and keyboard marker removal;
- optional snapping with visible `aria-pressed` state;
- keyboard commands for history, split, duplicate, delete, marker, and snapping.

## Deterministic world direction

- `MovieDirector.js` — playback lifecycle and deterministic seeking.
- `MovieDirectorFrame.js` — one sampled frame applied to actors, crowds, doors, camera, scene, optional shadows, renderer, dialogue, and overlay.
- `MovieActorDirector.js` / `MovieActorState.js` / `MovieActorRuntime.js` — player and optional legacy-NPC capability boundary.
- `MovieDoorDirector.js` — optional legacy-door capability boundary.
- `MovieCrowdDirector.js` — deterministic shared actors and procedural extras.
- `MovieCameraDirector.js` and camera helpers — authored camera placement and targets.
- `MovieSceneDirector.js` — scene-state application.
- `MovieOverlayDirector.js` — preview dialogue and overlays.

Optional runtime systems are guarded only where the active minimal world legitimately omits them. Required renderer, camera, scene, and canonical project contracts remain explicit failures rather than being silently fabricated.

## Project, transform, audio, and export

- `MovieProject.js` — normalize, validate, encode, and decode the canonical project.
- `MovieProjectNormalizer.js` / `MovieProjectValidator.js` — project, tracks, clips, graphs, and bounded markers.
- `MovieTransformInspector.js` / `MovieClipTransform.js` — selected clip transform editing with original-state capture.
- `MovieRecorder.js` / `MovieAudioEngine.js` — live browser capture and temporary audio graph lifecycle.
- `MovieExactRender.js` and `package/` — deterministic exact-package generation.
- `audio/` — validated audio clip and live scheduling helpers.

Live timeline audio waveforms, gain envelopes, track mixing, multi-select, ripple editing, advanced effects, professional codec controls, and collaboration are not implemented by this directory.

## Public API

`globalThis.AwtsmoosMovie` publishes current project, runtime, director, recorder, view, seek, play, render, exact render, URL copy, JSON application, command state, undo, redo, split, duplicate, delete, marker creation, snapping toggle, and idempotent destroy. Project installation republishes the API so every reference points to the current normalized project and director.

## Verification

Unit tests live in `src/test/movie`. Route tests live in `src/test/launcher`. Browser evidence and screenshots live under:

`ai-thoughts/2026-07-28T1012-mitzvahworld-nle-rebuild`

The final gates verify 120 tests, complete syntax, the 120-line JavaScript limit, scoped diff integrity, four responsive viewports, project ratio, overflow, inspector behavior, transport, move, both trims, command history, split, duplicate, delete recovery, markers, snapping, ordinary routing, accessibility, destroy, reopen, reload, console/network cleanliness, and six screenshot dimensions.

## Boundaries

- Read active imports and callers before treating similarly named legacy workspace files as canonical.
- Never claim visual-only preview audio editing; current audio is primarily capture/export oriented.
- Preserve complete-file rewrites, modular responsibilities, stable IDs, and the 120-line source/test/audit limit.
- Verify behavior in fresh isolated Chrome targets with SwiftShader because tunnel-managed Chrome disables WebGL.
