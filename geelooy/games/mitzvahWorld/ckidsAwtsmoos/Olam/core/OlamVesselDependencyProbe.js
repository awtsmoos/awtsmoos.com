// B"H
/**
 * @file OlamVesselDependencyProbe.js
 * @description
 * Chapter: The boxed gate is opened in parallel, before one silent stone can
 * swallow the whole road. Every OlamVessel dependency races its own timeout.
 */
const DEFAULT_TIMEOUT_MS = 7000;

const DEPENDENCIES = [
  ["THREE", "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js"],
  ["Nivra", "../../chayim/nivra.js?compact=true&v=village-combat-20260611-bh804"],
  ["OlamGrafting", "./OlamGraftingPlain.js?compact=true&v=starter-contracts-20260628-bh9"],
  ["OlamProperties", "../properties/index.js?compact=true&v=village-combat-20260611-bh804"],
  ["OlamInit", "./OlamInit.js?compact=true&v=village-combat-20260611-bh804"],
  ["Ayin", "../camera/index.js?compact=true&v=village-combat-20260611-bh804"],
  ["UserProgressManager", "../../systems/UserProgressManager.js?compact=true&v=village-combat-20260611-bh804"],
  ["Yichud", "../interaction/Yichud.js?compact=true&"],
  ["PlacementManager", "../interaction/PlacementManager.js?compact=true&"],
  ["CombatManager", "../../systems/combat/CombatManager.js?compact=true&v=combat-cache-budget-20260621-bh1"],
  ["WorldStateStore", "../../systems/worldState/WorldStateStore.js?compact=true&v=starter-contracts-20260628-bh9"],
  ["PixelRatioGovernor", "../../divine_systems/render/core/PixelRatioGovernor.js?compact=true&v=native-crisp-20260622-bh1"]
];

function absoluteUrl(path) {
  if (path.startsWith("/")) return new URL(path, location.origin).href;
  return new URL(path, import.meta.url).href;
}

function freshUrl(url, nonce) {
  return `${url}${url.includes("?") ? "&" : "?"}probe=${encodeURIComponent(nonce)}`;
}

function timeout(label, url, ms) {
  return new Promise(resolve => setTimeout(() => resolve({
    timeout: true,
    label,
    url,
    errorName: "AwtsmoosProbeTimeout",
    errorMessage: `Probe timed out importing ${label} after ${ms}ms at ${url}`
  }), ms));
}

async function probeOne([label, path], options) {
  const startedAt = performance.now();
  const url = freshUrl(absoluteUrl(path), `${options.nonce}-${label}`);
  try {
    const raced = await Promise.race([import(url), timeout(label, url, options.timeoutMs)]);
    if (raced?.timeout) return { ...raced, ok: false, ms: Math.round(performance.now() - startedAt) };
    return { label, ok: true, ms: Math.round(performance.now() - startedAt), url, exports: Object.keys(raced).sort() };
  } catch (error) {
    return {
      label,
      ok: false,
      ms: Math.round(performance.now() - startedAt),
      url,
      errorName: error?.name || "Error",
      errorMessage: error?.message || String(error),
      stack: String(error?.stack || "")
    };
  }
}

export async function probeOlamVesselDeps(options = {}) {
  const settings = {
    timeoutMs: Number(options.timeoutMs || DEFAULT_TIMEOUT_MS),
    nonce: options.nonce || `probe-${Date.now()}-${Math.random().toString(36).slice(2)}`
  };
  const results = await Promise.all(DEPENDENCIES.map(dependency => probeOne(dependency, settings)));
  return {
    ok: results.every(row => row.ok),
    timeoutMs: settings.timeoutMs,
    results,
    failed: results.filter(row => !row.ok),
    slowest: results.slice().sort((a, b) => b.ms - a.ms).slice(0, 5)
  };
}

export default probeOlamVesselDeps;
