B"H
# Monitor Sources

Nesher now exposes monitor capture as a first-class source.

Implementation details:
- `Add Monitor` calls `getDisplayMedia()` with monitor-oriented hints.
- Browser permission still controls the final picker choice.
- The chosen display surface is read from `track.getSettings().displaySurface`.
- The monitor source is a normal video source, so scenes, dragging, resizing, audio capture, and recording use the same stable path.

Important browser fact:
A web page cannot silently select a monitor. The user must choose the screen/window/tab in the picker. The app can request and label monitor capture, but Chrome owns permission and selection.
