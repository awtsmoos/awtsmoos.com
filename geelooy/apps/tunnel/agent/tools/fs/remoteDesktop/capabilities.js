// B"H
const os = require("os");
/** B"H — Chapter 926: Capabilities spoke truth before power. */
function platformCapabilities() {
  const platform = process.platform;
  const android = !!process.env.ANDROID_ROOT || String(os.release()).toLowerCase().includes("android");
  return { platform, arch:process.arch, android, watchOnlyFrameEnvelope:true, browserScreenshotSource:"planned-via-chrome-actions", webRtcSignaling:true, nativeScreenCapture:android ? "requires-mediaprojection-helper" : "requires-desktop-helper", nativeInputRelay:"requires-explicit-helper", mouseRelayPolicy:true, keyboardRelayPolicy:true };
}
function screenshotSourcePlan(payload = {}) { return { ok:true, source:payload.source || "browser-tab", status:"planned-helper-required", reason:"This action defines the capture seam. Actual pixels must come from Chrome screenshot or native MediaProjection/helper with visible consent.", nextAction:"remoteDesktopFramePush" }; }
module.exports = { platformCapabilities, screenshotSourcePlan };
