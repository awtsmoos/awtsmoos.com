// B"H
/** Foreground service skeleton: capture only while notification is visible. */
class CaptureService /* : Service */ {
  fun startVisibleCapture(sessionId: String) {
    // TODO: startForeground with persistent Awtsmoos stop action.
  }
  fun stopNow(reason: String) {
    // TODO: release MediaProjection and audit reason.
  }
}
