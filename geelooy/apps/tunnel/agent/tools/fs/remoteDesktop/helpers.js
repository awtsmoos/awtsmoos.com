// B"H
/** B"H — Chapter 932: Native helpers were named before they were summoned. */
function helperSkeletons() {
  return {
    android: {
      name: "awtsmoos-remote-android-helper",
      consent: ["MediaProjection permission screen", "foreground service notification", "one-click stop action"],
      modules: ["ConsentActivity.kt", "CaptureService.kt", "FrameEncoder.kt", "TunnelBridge.kt", "PanicStopReceiver.kt"],
      permissions: ["FOREGROUND_SERVICE", "POST_NOTIFICATIONS", "MediaProjection runtime grant"],
      status: "skeleton-required"
    },
    desktop: {
      name: "awtsmoos-remote-desktop-helper",
      consent: ["screen recording prompt", "visible tray/menu indicator", "panic stop hotkey"],
      modules: ["main.ts", "capture.ts", "input.ts", "indicator.ts", "audit.ts"],
      platforms: ["macOS ScreenCaptureKit", "Windows Graphics Capture", "Linux PipeWire portal"],
      status: "skeleton-required"
    }
  };
}
function helperChecklist() {
  return ["never start hidden", "bind helper to session token", "show persistent indicator", "record audit events", "support revoke and panic stop", "separate capture from input", "refuse clipboard/file transfer by default"];
}
module.exports = { helperSkeletons, helperChecklist };
