B"H

# Android Remote Helper Skeleton

Visible-consent MediaProjection helper skeleton. It must never start hidden.

Files planned:
- `ConsentActivity.kt`: asks Android MediaProjection permission.
- `CaptureService.kt`: foreground service with persistent stop notification.
- `FrameEncoder.kt`: encodes frames for tunnel delivery.
- `TunnelBridge.kt`: binds frames to a short-lived session token.
- `PanicStopReceiver.kt`: immediate revoke/stop path.

Blocked by default: clipboard, files, raw shell, credential reveal, invisible capture.
