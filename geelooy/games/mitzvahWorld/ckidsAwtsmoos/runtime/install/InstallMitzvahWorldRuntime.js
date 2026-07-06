// B"H
/** @file InstallMitzvahWorldRuntime.js @description Chapter 701: the six rivers enter one visible gate. */
import { installMitzvahWorldFeatureManifest } from "../MitzvahWorldFeatureManifest.js";
import { installMitzvahBrowserBridge } from "../browser/MitzvahBrowserBridge.js";
import { villageByTheRiverPreset } from "../presets/WorldPresets.js";
const GLOBAL_KEY = "__MITZVAH_WORLD_INSTALL__";
export function installMitzvahWorldRuntime(seed = {}) {
  const manifest = installMitzvahWorldFeatureManifest({ worldIntent:villageByTheRiverPreset(), ...seed });
  const bridge = installMitzvahBrowserBridge(manifest);
  const install = { ...manifest, bridge, installedAt:Date.now(), version:"six-step-runtime-20260706-bh1" };
  globalThis[GLOBAL_KEY] = install;
  manifest.runtime.markReady("runtime:install", { version:install.version });
  return install;
}
export function getInstalledMitzvahWorldRuntime() { return globalThis[GLOBAL_KEY] || null; }
export default installMitzvahWorldRuntime;
