<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Verification Plan

- Confirm Arbor displays to the user while `fathom` is sent in the payload.
- Use text longer than the observed two-minute output boundary.
- Verify every character range is assigned to exactly one chunk.
- Verify chunk order, voice, format, and conversation context in all requests.
- Verify the resulting download covers all chunks and is playable for the supported format.
- Verify progress and status text reflect multi-part generation.
- Re-read every touched file and run focused tests, syntax checks, diff checks, and browser smoke verification.
