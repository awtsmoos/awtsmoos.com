<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Verification Plan

- Inspect the ZIP with `unzip -t` or equivalent.
- Confirm the archive contains the expected extension root files rather than an accidental parent directory.
- Start or use the local server and request the exact public URL.
- Assert HTTP 200, ZIP content type, content disposition, and non-zero body size.
- Download the response and verify its archive integrity.
- Verify the installer page/link resolves to the same canonical URL.
- Run route tests, syntax checks, `git diff --check`, and a browser click smoke test.
