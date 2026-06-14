// B"H
/**
 * @file TreeRuntimeAudit.js
 * @description
 * Chapter 1023: runtime proof that tree visuals come from the approved source.
 */
const TREE_WORDS = /tree|forest|trunk|branch|canopy|leaf/i;
function looksTree(o) { const n = String(o?.name || ""); const d = o?.userData || {}; return TREE_WORDS.test(n) || d.heroTree || d.advancedGeelooyLibsTree || d.onlyApprovedTreeSource || d.treeSource; }
function approved(o) { const d = o?.userData || {}; return d.advancedGeelooyLibsTree === true || d.onlyApprovedTreeSource === true || String(d.treeSource || "").includes("/libs/awtsmoos3d/tree/heroTree.js"); }
export async function ensureTreeRuntimeAudit(context = {}) {
  const olam = context.olam || context, scene = context.scene || olam?.scene; if (!scene || !olam) return null;
  const all = [], bad = [];
  scene.traverse(o => { if (!looksTree(o)) return; const rec = { name: o.name || o.type || "unnamed", type: o.type || o.constructor?.name || "Object3D", approved: approved(o), source: o.userData?.treeSource || null }; all.push(rec); if (!rec.approved && !/octree|subtree|TreeRuntimeAudit/i.test(rec.name)) bad.push(rec); });
  const report = { at: Date.now(), totalTreeLike: all.length, approved: all.length - bad.length, unapproved: bad.length, bad: bad.slice(0, 80), sample: all.slice(0, 40) };
  olam.__AWTSMOOS_TREE_RUNTIME_AUDIT__ = report;
  if (bad.length) console.warn("B\"H | TREE_RUNTIME_AUDIT_UNAPPROVED", report); else console.info("B\"H | TREE_RUNTIME_AUDIT_APPROVED", report);
  return report;
}
export default { ensureTreeRuntimeAudit };
