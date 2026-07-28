B"H
Boruch Hashem
Blessed is He

# Critique and Improvements

The Awtsmoos tests every reel doorway before a single frame is promised.

## Risks in a Naive Integration

1. Importing MitzvahWorld runtime modules into social composer would couple bundles.
2. Sharing the gameplay runtime would risk loop, camera, HUD, and input collisions.
3. Calling the public `render()` helper would force an unwanted download.
4. Exact package output is IVF/WAV/manifest, not one directly uploadable social video.
5. Cross-origin assumptions would make iframe access brittle.
6. Rendering before `AwtsmoosMovie.ready` would fail nondeterministically.
7. Closing the dialog mid-render could orphan a capture.
8. Loading WebGL for upload-only users would waste memory and battery.
9. Attaching a Blob without a truthful filename/MIME would break previews.
10. A generated file must enter the same pending/uploaded lifecycle as normal video.
11. The studio frame must not silently navigate the parent page.
12. The social surface must explain that local rendering may take time.
13. The iframe needs a fallback open-in-new-tab path.
14. The reel dialog must restore focus after closing.
15. Mobile must not become a cramped desktop NLE.
16. The studio viewport must remain large enough for timeline interaction.
17. The quick-tool rail should not hide the Reel action offscreen without cues.
18. The generated attachment should carry project-title context.
19. Browser tests must not require a full 30-second render every run.
20. Game route and gameplay files must remain untouched.

## Improved Decisions

- Integrate by same-origin iframe only.
- Load the iframe only after the writer chooses MitzvahWorld Studio.
- Use `iframe.contentWindow.AwtsmoosMovie` as the only game contract.
- Use `AwtsmoosMovie.recorder.render({ download: false })` for one uploadable Blob.
- Convert the Blob into a File preserving result filename and MIME type.
- Send that File through existing root media actions.
- Add project title to attachment caption after insertion.
- Keep upload-first as a zero-WebGL path.
- Render progress appears in the social dialog, not only inside the iframe.
- Prevent duplicate renders with one explicit busy state.
- Keep the studio iframe isolated from composer keyboard handling.
- Add a polished Reel feature card and native dialog.
- Add Reel to the quick tools and keep existing tools unchanged.
- Use mobile full-screen/bottom-sheet geometry and desktop wide modal geometry.
- Test the bridge with a synthetic Blob-producing studio API.
- Test the actual iframe reaches the current published studio API.
- Test that the gameplay route still has no movie query.
- Assert scoped Git status shows no modified MitzvahWorld gameplay files from this feature.
- Keep every module under 120 lines.
- Preserve all current composer IDs, payloads, publishing, verses, media, and playlist behavior.
