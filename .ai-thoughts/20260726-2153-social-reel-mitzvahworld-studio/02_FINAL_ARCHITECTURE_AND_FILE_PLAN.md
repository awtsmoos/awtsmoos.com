B"H
Boruch Hashem
Blessed is He

# Final Architecture and File Plan

## Runtime Boundary

```text
Social Composer
  -> ReelMaker dialog
    -> Upload video
      -> existing mediaActions.add(root, FileList)
    -> Create in MitzvahWorld
      -> same-origin iframe
        -> current MitzvahWorld launcher
          -> movie query route
            -> createMovieStudio
              -> createEretzRuntime(startLoop=false)
              -> AwtsmoosMovie public API
      -> recorder.render(download=false)
      -> real Blob receipt
      -> File
      -> existing mediaActions.add(root, [file])
```

No MitzvahWorld gameplay source file will be modified.

## Files to Create

1. `geelooy/social-composer/js/reel/ReelMaker.js`
	- Dialog state, upload path, studio path, render state, focus restoration.
2. `geelooy/social-composer/js/reel/ReelMakerView.js`
	- Safe semantic dialog and compact feature card.
3. `geelooy/social-composer/js/reel/ReelStudioFrame.js`
	- Same-origin iframe URL, load, public API readiness polling, fallback link.
4. `geelooy/social-composer/js/reel/ReelRenderBridge.js`
	- Validate studio public API, call recorder with downloads disabled, turn Blob into File, attach through media actions.
5. `geelooy/social-composer/js/reel/ReelUpload.js`
	- Validate upload-first video selection and attach to root scope.
6. `geelooy/social-composer/js/ReelAssembly.js`
	- Assemble feature from editor media actions and status view.
7. `geelooy/social-composer/styles/redesign/reel/index.css`
8. `geelooy/social-composer/styles/redesign/reel/card.css`
9. `geelooy/social-composer/styles/redesign/reel/dialog.css`
10. `geelooy/social-composer/styles/redesign/reel/studio.css`
11. `geelooy/social-composer/styles/redesign/reel/mobile.css`
12. `tests/socialReelMakerContracts.test.mjs`
13. `tests/reelRenderBridge.test.mjs`

## Files to Rewrite

14. `geelooy/social-composer/js/ComposerAssembly.js`
	- Create reel assembly after editor assembly.
15. `geelooy/social-composer/js/civilization/mobileHierarchy.js`
	- Add Reel quick tool connected to the real feature card.
16. `geelooy/social-composer/styles/redesign/index.css`
	- Load reel styles last.
17. Update focused composer tests expecting quick-tool count.

## Verification

- All new files remain below 120 lines.
- Syntax checks pass.
- Reel bridge tests prove a real Blob becomes a root video File attachment.
- Upload-first tests prove video files use the same path.
- Browser test opens dialog and verifies focus/geometry.
- Browser test uses a synthetic `AwtsmoosMovie` API to prove render progress and attachment.
- Browser test loads the real MitzvahWorld movie iframe and observes `AwtsmoosMovie.ready`.
- Gameplay route without movie parameters still resolves normally.
- Scoped Git status confirms no MitzvahWorld gameplay file was written by this feature.
- Existing Home, composer, destination, playlist, media, profile, CSS, and social suites pass.
