// B"H
/**
 * Lightweight Olam grafting gate.
 *
 * This file must stay tiny. It loads only the methods needed to render and move
 * the first playable world, then leaves editing/letters/helpers/non-hot methods
 * to later dynamic grafts. The old compact bundle pulled the whole Olam method
 * forest into one multi-megabyte startup script.
 */
const SEAL = "graft-core-only-20260709-bh2";
const CORE = Object.freeze([
  ["load nivrayim/world scene", "../methods/loadNivrayim/index.js?compact=true&v=actual-tested-live-gates-20260709-bh5"],
  ["loading event methods", "../methods/loadingPlain.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11"],
  ["frame update loop", "../methods/heesHawvoos.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11"],
  ["canvas setup", "../methods/canvasSetup.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11"],
  ["placeholder/entity logic", "../methods/placeholderAndEntities/index.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11"],
  ["lighting/ohr", "../methods/ohr.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11"],
  ["create nivra", "../methods/boyrayNivra.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11"]
]);
const DEFERRED = Object.freeze([
  ["hoyseef/add object", "../methods/hoyseef.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11"],
  ["entity registry", "../methods/entityLogic.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11"],
  ["hebrew letters", "../methods/hebrewLetters.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11"],
  ["helpers", "../methods/helpers.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11"],
  ["remove object", "../methods/sealayk.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11"]
]);
function report(type, stage, fields = {}) {
  const payload = { ...fields, type, stage, text:stage, seal:SEAL, compactStaticGraft:false };
  try { if (typeof self !== "undefined" && self.postMessage) self.postMessage(payload); } catch {}
  try { if (globalThis.__AWTS_VERBOSE_GRAFT__ === true) console.info('B"H | OLAM_GRAFTING_PROOF', payload); } catch {}
}
function graftPrototype(olam, ClassDef, label) {
  if (!ClassDef?.prototype) return 0;
  let count = 0;
  for (const name of Object.getOwnPropertyNames(ClassDef.prototype)) {
    if (name === "constructor") continue;
    olam[name] = ClassDef.prototype[name].bind(olam);
    count += 1;
  }
  report("worker_progress", "olam-graft:grafted", { moduleLabel:label, methods:count });
  return count;
}
async function graftList(olam, rows, stage) {
  report("worker_progress", `${stage}:start`, { count:rows.length });
  const modules = await Promise.all(rows.map(async ([label, path]) => [label, (await import(path)).default]));
  for (const [label, ClassDef] of modules) graftPrototype(olam, ClassDef, label);
  report("worker_progress", `${stage}:done`, { count:rows.length });
}
async function graftBrowserTzimtzum(olam) {
  if (typeof document === "undefined") return;
  try {
    const module = await import("../methods/tzimtzum/index.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11");
    graftPrototype(olam, module.default, "tzimtzum browser orchestrator");
  } catch (error) { console.error('B"H - Failed to graft Tzimtzum Orchestrator', error); }
}
async function graftDeferred(olam) {
  if (olam.__deferredOlamGraftReady || olam.__deferredOlamGraftLoading) return olam.__deferredOlamGraftLoading;
  olam.__deferredOlamGraftLoading = (async () => {
    try {
      await graftList(olam, DEFERRED, "olam-graft:deferred");
      await graftBrowserTzimtzum(olam);
      olam.__deferredOlamGraftReady = { ok:true, at:Date.now(), seal:SEAL };
    } catch (error) {
      olam.__deferredOlamGraftReady = { ok:false, at:Date.now(), message:String(error?.message || error), seal:SEAL };
      console.warn('B"H deferred Olam graft failed', error);
    }
    return olam.__deferredOlamGraftReady;
  })();
  return olam.__deferredOlamGraftLoading;
}
export default class OlamGrafting {
  static async graft(olam) {
    await graftList(olam, CORE, "olam-graft:core");
    const listeners = await import("../eventListeners/index.js?compact=true&v=final-ready-grass-gate-fix-20260708-bh11");
    if (typeof listeners.default === "function") listeners.default.call(olam);
    olam.ensureDeferredOlamGraft = () => graftDeferred(olam);
    setTimeout(() => graftDeferred(olam), 5500);
    report("worker_progress", "olam-graft:done", { core:CORE.length, deferred:DEFERRED.length });
  }
}
