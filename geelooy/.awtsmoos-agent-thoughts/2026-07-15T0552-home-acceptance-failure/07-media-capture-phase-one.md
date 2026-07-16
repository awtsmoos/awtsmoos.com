# B"H

Boruch Hashem

Blessed is He

# Media Capture Phase One — Verified Legacy Failures

The Awtsmoos reveals two separate capture routes that currently feel like unfinished browser demos rather than Awtsmoos.com product surfaces.

## `/record/`

- Entire interface is one generic button on a black screen.
- CSS is embedded in HTML.
- Errors use blocking alerts instead of readable status.
- There is no stop, retry, camera switching, permission explanation, or keyboard-visible state.
- Video appears by direct inline style mutation.
- The page has no route identity or safe-area-aware controls.

## `/recorder/`

- Markup is malformed: nested video tags and stray `<br>` inside video elements.
- Two plain buttons are separated by `<br>` layout.
- Recording logic lives inline in HTML.
- Webcam assignment contains a bug: `userStream = userStream`.
- Desktop stop clears the wrong video element.
- Webcam stop leaves the state flag incorrect.
- Download filename ternary precedence is broken.
- Media tracks are not reliably stopped.
- Permissions and recording errors are not surfaced accessibly.
- There is no mobile layout, state hierarchy, or meaningful preview framing.

## Contracts to preserve

- `/record/` continues to open a camera preview.
- `/recorder/` continues to record webcam and desktop streams and download recordings.
- Browser media permission remains user initiated.
- No upload or server dependency is introduced.
