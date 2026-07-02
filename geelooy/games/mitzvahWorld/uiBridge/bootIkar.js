// B"H
/** Installs bridge and imports world engine with compact mode and a fresh seal. */
import { UI_BRIDGE_SEAL, traceBoot } from "./bridgeSeal.js?v=house-solid-loader-compact-20260702-bh3&compact=true";
import { installBrowserHelpers } from "./browserHelpers.js?v=house-solid-loader-compact-20260702-bh3&compact=true";
import { describeAwtsmoosError } from "./bootErrors.js?v=house-solid-loader-compact-20260702-bh3&compact=true";
import { installUiBridge } from "./installUiBridge.js?v=house-solid-loader-compact-20260702-bh3&compact=true";
let bootStarted = false;
function ensureDefaultPath() { const u = new URL(location.href); if (!u.searchParams.has("path")) { u.searchParams.set("path", "village.json"); history.replaceState(history.state, "", u.href); } }
function engineUrl() { return new URL(`../ckidsAwtsmoos/ikar.js?compact=true&v=${UI_BRIDGE_SEAL}`, import.meta.url).href; }
const progress = payload => window.__AWTSMOOS_LOADING_PROGRESS__?.update?.(payload);
export function bootIkarNow() {
  if (bootStarted || typeof window === "undefined" || !window.document) return; bootStarted = true; ensureDefaultPath();
  window.__AWTSMOOS_BOOT_STARTED__ = { at: new Date().toISOString(), readyState: document.readyState, seal: UI_BRIDGE_SEAL };
  progress({ stage: "world-engine:ui-bridge", total: 28, world: 28, action: "Preparing compact world controls...", subAction: "UI bridge installed" });
  installUiBridge(); installBrowserHelpers(); const url = engineUrl();
  progress({ stage: "world-engine:import:start", total: 34, world: 34, action: "Importing compact world engine...", subAction: "compact=true active" });
  import(url).then(module => { window.__AWTSMOOS_BOOT_LOADED__ = { at: new Date().toISOString(), keys: Object.keys(module || {}).slice(0, 20), seal: UI_BRIDGE_SEAL }; progress({ stage: "world-engine:import:done", total: 48, world: 48, action: "World engine ready", subAction: "first playable frame next" }); if (traceBoot()) console.info('B"H - Mitzvah World engine imported', window.__AWTSMOOS_BOOT_LOADED__); }).catch(error => { progress({ stage: "world-engine:import:error", total: 58, world: 58, action: "Refreshing compact world import...", subAction: error?.message || String(error), softError: true }); describeAwtsmoosError(error, { label: "Index [Main]: Failed to load UI starter", phase: "dynamic import", moduleURL: url }); });
}
