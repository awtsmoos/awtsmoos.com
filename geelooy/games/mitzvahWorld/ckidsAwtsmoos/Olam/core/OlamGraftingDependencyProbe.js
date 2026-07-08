// B"H
/** Probe the static dependencies of OlamGraftingPlain without booting Olam. */
const DEPS = [
  ["loadingPlain", "../methods/loadingPlain.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1"],
  ["entityLogic", "../methods/entityLogic.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1"],
  ["hebrewLetters", "../methods/hebrewLetters.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1"],
  ["heesHawvoos", "../methods/heesHawvoos.js?compact=true&v=compact-engine-20260702-bh2"],
  ["HelpersBridge", "../methods/helpers.js?compact=true&v=visible-root-binding-20260610-bh710"],
  ["loadNivrayim", "../methods/loadNivrayim/index.js?compact=true&v=zone-reality-20260614-bh817"],
  ["placeholderAndEntities", "../methods/placeholderAndEntities/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1"],
  ["hoyseef", "../methods/hoyseef.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1"],
  ["sealayk", "../methods/sealayk.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1"],
  ["bindAllListeners", "../eventListeners/index.js?compact=true&v=starter-contracts-20260628-bh9"],
  ["npcRuntime", "../npc/NpcInteractionRuntime.js?compact=true&v=npc-runtime-exports-20260616-bh1"]
];

function urlOf(path) { return new URL(path, import.meta.url).href; }
function fresh(url, nonce) { return `${url}${url.includes("?") ? "&" : "?"}probe=${encodeURIComponent(nonce)}`; }
function timeout(label, url, ms) {
  return new Promise(resolve => setTimeout(() => resolve({ timeout:true, label, url, errorName:"ProbeTimeout", errorMessage:`Timed out ${label}` }), ms));
}

async function one([label, path], opts) {
  const started = performance.now();
  const url = fresh(urlOf(path), `${opts.nonce}-${label}`);
  try {
    const module = await Promise.race([import(url), timeout(label, url, opts.timeoutMs)]);
    if (module?.timeout) return { ...module, ok:false, ms:Math.round(performance.now() - started) };
    return { label, ok:true, ms:Math.round(performance.now() - started), url, exports:Object.keys(module).sort() };
  } catch (error) {
    return { label, ok:false, ms:Math.round(performance.now() - started), url, errorName:error?.name || "Error", errorMessage:String(error?.message || error).slice(0,300) };
  }
}

export async function probeOlamGraftingDeps(options = {}) {
  const opts = { timeoutMs:Number(options.timeoutMs || 7000), nonce:options.nonce || `graft-${Date.now()}` };
  const results = await Promise.all(DEPS.map(dep => one(dep, opts)));
  return { ok:results.every(r => r.ok), failed:results.filter(r => !r.ok), results };
}

export default probeOlamGraftingDeps;
