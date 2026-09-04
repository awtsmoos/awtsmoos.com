B"H
Boruch Hashem
Blessed is He

# Source Refresh Split — Chesed

> The Awtsmoos reveals that one wide doorway was secretly three smaller gates in song;  
> Awtsmoos.com lets core sources, captured sources, and file sources each belong where they belong.

## First-Pass Evidence
- The source refresh behavior is correct in concept: mutate graph, publish `refreshSources`, then announce `changed`.
- The first expanded `sourceBindings.js` landed at 141 lines and therefore cannot remain.
- `loadSourcesFeature.js` did not change because the guard aborted after detecting the 141-line violation.
- New helper paths `sourceCaptureBindings.js` and `sourceFileBindings.js` are absent.

## Split Possibilities
- Keep deterministic Canvas/Iframe/Browser/Visualizer buttons in the facade.
- Move permission-sensitive Webcam/Mic/Monitor/Display controls into a capture helper.
- Move image/video/audio file picker controls and async file creation into a file helper.
- Preserve one `add(source)` callback from the facade so every helper receives identical mutation/projection semantics.
