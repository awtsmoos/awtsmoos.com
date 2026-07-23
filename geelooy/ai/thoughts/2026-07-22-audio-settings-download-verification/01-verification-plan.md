<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Verification Plan

## Question

Verify whether the current message audio flow truly downloads generated audio using the voice, speed, format, and related settings selected by the user.

## Evidence path

1. Read the current audio offer view and saved-settings logic.
2. Trace the click router from the menu action into generation and download.
3. Trace the provider request payload and returned binary/blob handling.
4. Confirm which settings are actually sent and which are merely visual.
5. Run a focused executable test with a fake AI handler that records the request and returns deterministic audio bytes.
6. Check Git history only when the current code does not explain the intended setting contract.

## Completion gate

Do not answer “yes” unless the generated request demonstrably contains the selected settings and the download action demonstrably uses the returned audio artifact.
