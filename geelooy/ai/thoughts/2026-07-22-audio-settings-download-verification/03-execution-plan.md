<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Execution Plan

## Files expected to inspect

- `js/chatgpt/audio/audioOfferView.js`
- `js/chatgpt/audio/audioActionRouter.js`
- `js/chatgpt/audio/audioCatalog.js`
- `js/chatgpt/audio/audioPlayerView.js`
- Any synthesis service or AI-handler method reached by the router
- Existing audio tests and browser smoke harnesses

## Test design

Create a focused test that constructs the audio panel, selects non-default settings, invokes the generate/download action through the real router boundary, records the exact request passed to the fake handler, returns deterministic audio bytes, and asserts that the produced download/player artifact corresponds to those bytes and selected format.

## Decision rule

- Report “verified” only when all selected supported settings propagate.
- Report a precise limitation when a setting is present in the UI but not propagated.
- Repair the implementation only when the current code is demonstrably incorrect and the correction remains inside this request.
