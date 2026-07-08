// B"H
/** @file actionBarLayoutRuntime.js @description Keeps the action bar bottom-anchored without per-frame work. */
import { installMobileVisualViewportInsets } from "../mobileVisualViewportInsets.js?compact=true&v=solid-browser-verify-20260702-bh9";
const STYLE_ID = "awts-action-bar-layout-runtime";
const OBSERVER_KEY = "__awtsActionBarLayoutObserver";

const CSS = `
#actionBar.combat-action-dock{position:fixed!important;left:50%!important;right:auto!important;top:auto!important;bottom:calc(var(--awts-visual-bottom,0px) + 10px + env(safe-area-inset-bottom,0px))!important;transform:translateX(-50%)!important;width:max-content!important;height:68px!important;max-height:68px!important;display:flex!important;align-items:flex-end!important;justify-content:center!important;overflow:visible!important;z-index:27000!important;pointer-events:none!important;background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important;margin:0!important;contain:layout style!important}
#actionSlots{position:relative!important;display:grid!important;grid-template-columns:repeat(6,54px)!important;gap:6px!important;padding:7px!important;width:max-content!important;height:auto!important;border-radius:17px!important;background:rgba(7,12,22,.82)!important;border:1px solid rgba(255,224,138,.36)!important;box-shadow:0 10px 24px rgba(0,0,0,.4)!important;backdrop-filter:blur(8px)!important;pointer-events:auto!important;box-sizing:border-box!important}
#actionBar .actionSlot{height:52px!important;min-height:52px!important;max-height:52px!important;width:54px!important;border-radius:12px!important;background:radial-gradient(circle at 50% 18%,rgba(112,141,160,.5),rgba(13,24,37,.96) 64%)!important;border:1px solid rgba(235,210,130,.48)!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-direction:column!important;position:relative!important;overflow:hidden!important;touch-action:manipulation!important;color:#fff!important;padding:0!important;box-sizing:border-box!important}
#actionBar .attack-slot{background:radial-gradient(circle at 50% 18%,rgba(255,116,74,.68),rgba(81,25,22,.98) 70%)!important}#actionBar .slotIcon{font:900 19px/1 Arial!important}#actionBar .slotName{font:700 8px/1 Arial!important;color:#fff2bd!important;max-width:48px!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}#actionBar .slotKey{position:absolute!important;left:4px!important;bottom:3px!important;min-width:12px!important;height:12px!important;border-radius:4px!important;text-align:center!important;font:800 8px/12px Arial!important;color:#9fffd0!important;background:rgba(0,0,0,.55)!important}
@media(max-width:820px),(max-height:720px){#actionBar.combat-action-dock{top:auto!important;bottom:calc(var(--awts-visual-bottom,0px) + 8px + env(safe-area-inset-bottom,0px))!important;width:min(46vw,260px)!important;height:44px!important;max-height:44px!important}#actionSlots{grid-template-columns:repeat(6,minmax(26px,1fr))!important;gap:3px!important;padding:4px!important;width:100%!important;max-height:40px!important;border-radius:12px!important;box-sizing:border-box!important}#actionBar .actionSlot{height:31px!important;min-height:31px!important;max-height:31px!important;width:auto!important;border-radius:8px!important;padding:1px!important}#actionBar .slotIcon{font-size:13px!important}#actionBar .slotName{display:none!important}#actionBar .slotKey{font-size:7px!important;height:9px!important;line-height:9px!important;min-width:9px!important}}
@media(max-width:430px){#actionBar.combat-action-dock{width:min(44vw,230px)!important;height:42px!important;max-height:42px!important}#actionBar .actionSlot{height:30px!important;min-height:30px!important;max-height:30px!important}}
`;

function inject(doc) {
  if (!doc || doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  doc.head.appendChild(style);
}

function pin(el) {
  if (!el) return;
  el.style.position = "fixed";
  el.style.left = "50%";
  el.style.right = "auto";
  el.style.top = "auto";
  el.style.bottom = "calc(var(--awts-visual-bottom,0px) + 8px + env(safe-area-inset-bottom,0px))";
  el.style.transform = "translateX(-50%)";
  el.style.margin = "0";
}

/** Installs CSS once and watches only style/class mutations that can move the dock. */
export function installActionBarLayoutRuntime(el = document.getElementById("actionBar")) {
  const doc = el?.ownerDocument || globalThis.document;
  installMobileVisualViewportInsets(doc, globalThis.window);
  inject(doc);
  if (!el) return false;
  pin(el);
  if (el[OBSERVER_KEY]) return true;
  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; pin(el); });
  });
  observer.observe(el, { attributes:true, attributeFilter:["style", "class"] });
  el[OBSERVER_KEY] = observer;
  return true;
}

export default installActionBarLayoutRuntime;
