// B"H
/** Boots Mitzvah World through the compact ES-module engine bundle. */
import { UI_BRIDGE_SEAL, traceBoot } from "./bridgeSeal.js?v=compact-engine-safe-20260702-bh1";
import { installBrowserHelpers } from "./browserHelpers.js?v=compact-engine-safe-20260702-bh1";
import { describeAwtsmoosError } from "./bootErrors.js?v=compact-engine-safe-20260702-bh1";
import { installUiBridge } from "./installUiBridge.js?v=compact-engine-safe-20260702-bh1";
let bootStarted = false;
function ensureDefaultPath() { const u = new URL(location.href); if (!u.searchParams.has("path")) { u.searchParams.set("path", "village.json"); history.replaceState(history.state, "", u.href); } }
function engineUrl() { return new URL(`../ckidsAwtsmoos/ikar.js?v=${UI_BRIDGE_SEAL}-module-shell`, import.meta.url).href; }
const progress = payload => window.__AWTSMOOS_LOADING_PROGRESS__?.update?.(payload);
async function importEngine(url) {
  progress({ stage:"world-engine:import:start", total:34, world:34, action:"Importing world engine shell...", subAction:"module shell; compact graph below" });
  const module = await import(url);
  window.__AWTSMOOS_BOOT_LOADED__ = { at:new Date().toISOString(), keys:Object.keys(module || {}).slice(0, 20), seal:UI_BRIDGE_SEAL, compactEngine:"below-ikar" };
  progress({ stage:"world-engine:import:done", total:48, world:48, action:"World engine shell ready", subAction:"first playable frame next" });
  if (traceBoot()) console.info('B"H - Mitzvah World engine shell imported', window.__AWTSMOOS_BOOT_LOADED__);
}
export function bootIkarNow() {
  if (bootStarted || typeof window === "undefined" || !window.document) return;
  bootStarted = true; ensureDefaultPath();
  window.__AWTSMOOS_BOOT_STARTED__ = { at:new Date().toISOString(), readyState:document.readyState, seal:UI_BRIDGE_SEAL, compactEngine:"below-ikar" };
  progress({ stage:"world-engine:ui-bridge", total:28, world:28, action:"Preparing world controls...", subAction:"UI bridge installed" });
  installUiBridge(); installBrowserHelpers(); const url = engineUrl();
  importEngine(url).catch(error => { progress({ stage:"world-engine:import:error", total:58, world:58, action:"World engine import failed", subAction:error?.message || String(error), softError:true }); describeAwtsmoosError(error, { label:"Index [Main]: Failed to load world engine", phase:"dynamic import", moduleURL:url }); });
}
