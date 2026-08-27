B"H

# Desktop Remote Helper Skeleton

Visible screen capture and optional input helper. It must show a persistent indicator and panic stop.

Platform seams:
- macOS: ScreenCaptureKit + Screen Recording permission.
- Windows: Windows Graphics Capture.
- Linux: PipeWire portal.

Input relay remains separate from capture and requires explicit mouse/keyboard grants.
