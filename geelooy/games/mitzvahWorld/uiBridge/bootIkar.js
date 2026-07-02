// B"H
/** @file bootIkar.js @description Installs bridge and imports the world engine with refreshed cache. */
import { UI_BRIDGE_SEAL, traceBoot } from "./bridgeSeal.js?v=production-vessel-refresh-20260702-bh1";
import { installBrowserHelpers } from "./browserHelpers.js?v=production-vessel-refresh-20260702-bh1";
import { describeAwtsmoosError } from "./bootErrors.js?v=production-vessel-refresh-20260702-bh1";
import { installUiBridge } from "./installUiBridge.js?v=production-vessel-refresh-20260702-bh1";
let bootStarted = false;
function ensureDefaultPath() { const url = new URL(location.href); if (url.searchParams.has("path")) return; url.searchParams.set("path", "village.json"); history.replaceState(history.state, "", url.href); }
function engineUrl() { return new URL(`../ckidsAwtsmoos/ikar.js?compact=true&bh=${UI_BRIDGE_SEAL}`, import.meta.url).href; }
function progress(payload) { window.__AWTSMOOS_LOADING_PROGRESS__?.update?.(payload); }
export function bootIkarNow() {
  if (bootStarted || typeof window === "undefined" || !window.document) return;
  bootStarted = true; ensureDefaultPath();
  window.__AWTSMOOS_BOOT_STARTED__ = { at:new Date().toISOString(), readyState:document.readyState, seal:UI_BRIDGE_SEAL };
  progress({ stage:"world-engine:ui-bridge", total:28, world:28, action:"Preparing world controls...", subAction:"UI bridge installed" });
  installUiBridge(); installBrowserHelpers(); const url = engineUrl();
  progress({ stage:"world-engine:import:start", total:32, world:32, action:"Importing world engine...", subAction:"fresh worker route" });
  import(url).then(module => {
    window.__AWTSMOOS_BOOT_LOADED__ = { at:new Date().toISOString(), keys:Object.keys(module || {}).slice(0, 20), seal:UI_BRIDGE_SEAL };
    progress({ stage:"world-engine:import:done", total:44, world:44, action:"World engine ready", subAction:"worker and canvas handshake next" });
    if (traceBoot()) console.info('B"H - Mitzvah World engine imported', window.__AWTSMOOS_BOOT_LOADED__);
  }).catch(error => {
    progress({ stage:"world-engine:import:error", total:58, world:58, action:"Refreshing world engine import...", subAction:error?.message || String(error), softError:true });
    describeAwtsmoosError(error, { label:"Index [Main]: Failed to load UI starter", phase:"dynamic import", moduleURL:url });
  });
}
