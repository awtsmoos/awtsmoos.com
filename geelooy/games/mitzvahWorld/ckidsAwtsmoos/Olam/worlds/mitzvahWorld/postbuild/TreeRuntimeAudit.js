// B"H
/** @file TreeRuntimeAudit.js @description Runtime proof that tree visuals come from the approved procedural-core source. */
const TREE_WORDS = /tree|forest|trunk|branch|canopy|leaf/i;
function dataOf(object) { return object && object.userData ? object.userData : {}; }
function nameOf(object) { return String(object && object.name ? object.name : ""); }
function typeOf(object) { if (!object) return "Object3D"; if (object.type) return object.type; return object.constructor && object.constructor.name ? object.constructor.name : "Object3D"; }
function looksTree(object) { const name = nameOf(object), data = dataOf(object); return Boolean(TREE_WORDS.test(name) || data.heroTree || data.advancedGeelooyLibsTree || data.onlyApprovedTreeSource || data.treeSource); }
function approved(object) { const data = dataOf(object), source = String(data.treeSource || ""); return data.advancedGeelooyLibsTree === true || data.onlyApprovedTreeSource === true || source.includes("/libs/awtsmoos-procedural-core/src/core") || source.includes("/libs/awtsmoos3d/tree/heroTree.js"); }
function record(object) { const data = dataOf(object); return { name:nameOf(object) || typeOf(object) || "unnamed", type:typeOf(object), approved:approved(object), source:data.treeSource || null }; }
function sceneOf(context) { const olam = context && context.olam ? context.olam : context; return context && context.scene ? context.scene : olam && olam.scene ? olam.scene : null; }
function olamOf(context) { return context && context.olam ? context.olam : context; }
export async function ensureTreeRuntimeAudit(context = {}) {
  const olam = olamOf(context), scene = sceneOf(context); if (!scene || !olam) return null;
  const all = [], bad = [];
  scene.traverse(object => { if (!looksTree(object)) return; const rec = record(object); all.push(rec); if (!rec.approved && !/octree|subtree|TreeRuntimeAudit/i.test(rec.name)) bad.push(rec); });
  const report = { at:Date.now(), totalTreeLike:all.length, approved:all.length - bad.length, unapproved:bad.length, bad:bad.slice(0,80), sample:all.slice(0,40) };
  olam.__AWTSMOOS_TREE_RUNTIME_AUDIT__ = report;
  const logs = typeof globalThis !== "undefined" && globalThis.__AWTSMOOS_TREE_AUDIT_LOGS__ === true;
  if (logs) console[bad.length ? "warn" : "info"]("B\"H | TREE_RUNTIME_AUDIT", report);
  return report;
}
export default { ensureTreeRuntimeAudit };
