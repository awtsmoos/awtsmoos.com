// B"H
import { fastUiMode } from "./performance/FastUiMode.js";
import { viewportMode } from "./responsive/ViewportModeDetector.js";
import { ensureMobileOverlapCss } from "./responsive/MobileOverlapFixCss.js";
import { compactHud } from "./mobile/MobileHudCompaction.js";
import { compactDock } from "./mobile/MobileDockCompaction.js";
import { compactModals } from "./mobile/MobileModalCompaction.js";
import { mobileLayoutTuning } from "./mobile/MobileLayoutTuning.js";
import { mobileSafeAreaTuning } from "./mobile/MobileSafeAreaTuning.js";
function apply(win = globalThis.window, doc = globalThis.document) {
  if (!doc) return null;
  const mode = viewportMode(win), fast = fastUiMode(win), layout = mobileLayoutTuning(mode);
  ensureMobileOverlapCss(doc); mobileSafeAreaTuning(doc);
  doc.documentElement.classList.toggle("awtsmoos-mobile", mode.mobile);
  doc.documentElement.classList.toggle("awtsmoos-desktop", !mode.mobile);
  doc.documentElement.classList.toggle("awtsmoos-fast-ui", fast.noHeavyBlur || layout.reduceBlur);
  doc.documentElement.classList.toggle("awtsmoos-hide-world-markers", layout.hideWorldMarkers);
  doc.documentElement.style.setProperty("--awt-hud-scale", String(layout.hudScale));
  doc.documentElement.style.setProperty("--awt-dock-scale", String(layout.dockScale));
  doc.documentElement.style.setProperty("--awt-modal-width", layout.modalWidth);
  doc.documentElement.style.setProperty("--awt-modal-max-height", layout.modalMaxHeight);
  compactHud(doc); compactDock(doc); compactModals(doc);
  const report = { ok:true, mode, fast, layout, root:Boolean(doc.querySelector("#ikar")), bridge:Boolean(doc.querySelector("#mitzvahUiBridge")) };
  win.__AWTSMOOS_MOBILE_UI_PATCH__ = report;
  win.__AWTSMOOS_MOBILE_UI_PATCH_REPORT__ = () => report;
  return report;
}
apply();
globalThis.window?.addEventListener?.("resize", () => apply(), { passive:true });
globalThis.window?.addEventListener?.("orientationchange", () => setTimeout(() => apply(), 120), { passive:true });
export { apply as applyOpenWorldUiMobilePatch };
export default apply;
