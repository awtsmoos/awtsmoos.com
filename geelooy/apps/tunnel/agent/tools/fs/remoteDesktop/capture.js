// B"H
/**
 * B"H
 * Chapter 928: The first capture adapter refused to lie.
 * It can package caller-supplied pixels now, or create a diagnostic SVG from a
 * Chrome snapshot. Real screenshots remain a helper/CDP seam until implemented.
 */
function chromeFramePlan(payload = {}) { return { ok:true, source:payload.source || "chrome", adapter:"chrome-snapshot-to-frame", status:"available-diagnostic-frame", note:"Creates a watch frame from supplied snapshot text or caller-supplied frame64. Real Page.captureScreenshot requires a Chrome screenshot helper." }; }
function frameFromPayload(payload = {}) {
  if (payload.frame64) return { contentType:payload.contentType || "image/jpeg", frame64:payload.frame64, bytes:String(payload.frame64).length, note:"caller supplied frame" };
  const text = payload.snapshot || payload.text || payload.title || "Chrome snapshot frame seam";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="100%" height="100%" fill="#04140b"/><text x="28" y="54" fill="#9fffba" font-size="28">B&quot;H Chrome Frame Seam</text><foreignObject x="28" y="82" width="584" height="230"><body xmlns="http://www.w3.org/1999/xhtml" style="color:#dfffe8;font:16px monospace;white-space:pre-wrap">${escapeXml(String(text).slice(0,900))}</body></foreignObject></svg>`;
  return { contentType:"image/svg+xml", frame64:Buffer.from(svg).toString("base64"), bytes:svg.length, note:"diagnostic frame from snapshot text" };
}
function nativeHelperPlan() { return { android:["MediaProjection consent activity","foreground service indicator","frame encoder","tunnel action bridge"], desktop:["screen-recording permission prompt","visible tray/menu indicator","capture encoder","input helper with panic stop"], shared:["short-lived session token","audit stream","revoke button","helper version check"] }; }
function peerConnectionPlan() { return { signaling:["offer","answer","ice","heartbeat","fingerprint"], ui:["local fingerprint","remote fingerprint","connection state","last heartbeat"], transportStatus:"signaling-ready-peer-stream-planned" }; }
function escapeXml(text) { return text.replace(/[<>&]/g, ch => ({ "<":"&lt;", ">":"&gt;", "&":"&amp;" }[ch])); }
module.exports = { chromeFramePlan, frameFromPayload, nativeHelperPlan, peerConnectionPlan };
