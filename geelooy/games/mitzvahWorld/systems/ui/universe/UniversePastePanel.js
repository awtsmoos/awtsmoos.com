// B"H
/** Tiny optional paste panel for universe JSON. */
import { installUniverseJsonWindowBridge } from "../../universe/UniverseJsonWindowBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
function el(tag, props = {}) { const node = document.createElement(tag); Object.assign(node, props); return node; }
export function installUniversePastePanel(win = window, doc = document) {
  installUniverseJsonWindowBridge(win);
  if (doc.getElementById("awtsmoos-universe-paste-panel")) return { installed:false, reason:"already_exists" };
  const box = el("section", { id:"awtsmoos-universe-paste-panel" });
  box.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:99999;width:320px;background:#08121d;color:white;border:1px solid #58b;padding:8px;font:12px monospace";
  const area = el("textarea", { placeholder:"Paste Universe JSON", rows:7 }); area.style.cssText = "width:100%;box-sizing:border-box;background:#02060a;color:#dff";
  const btn = el("button", { textContent:"Load Universe JSON" }); const out = el("pre", { textContent:"ready" }); out.style.whiteSpace = "pre-wrap";
  btn.onclick = () => { try { const row = win.awtsmoosPasteUniverseJson(area.value); out.textContent = JSON.stringify({ ok:true, id:row.id, records:win.__AWTSMOOS_UNIVERSE_RUNTIME_REGISTRY__.records.length }, null, 2); } catch (e) { out.textContent = JSON.stringify({ ok:false, error:e.message }, null, 2); } };
  box.append(area, btn, out); doc.body.appendChild(box); return { installed:true };
}
if (typeof window !== "undefined" && window.location.search.includes("awtsmoosUniversePaste=1")) installUniversePastePanel(window, document);
