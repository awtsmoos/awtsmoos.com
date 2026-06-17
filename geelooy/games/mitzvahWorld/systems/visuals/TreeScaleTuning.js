// B"H
const TREE_RE = /tree|etz|cedar|oak|pine|foliage|leaf|leaves|trunk/i;
export function treeScaleTuning(tier = {}) { return { enabled:true, minYScale:2.2, maxYScale:tier.mobile ? 3.1 : 3.8, canopyScale:1.18, horizontalScale:1.05 }; }
export function applyTreeScale(root, tuning = treeScaleTuning()) { if (!root || !tuning.enabled) return { touched:0 }; let touched = 0; const visit = node => { if (!node) return; const name = `${node.name || ""} ${node.userData?.id || ""} ${node.userData?.type || ""}`; if (TREE_RE.test(name) && node.scale) { node.scale.y = Math.max(node.scale.y || 1, tuning.minYScale); node.scale.x = Math.max(node.scale.x || 1, tuning.horizontalScale); node.scale.z = Math.max(node.scale.z || 1, tuning.horizontalScale); touched++; } if (node.children) node.children.forEach(visit); }; visit(root); return { touched }; }
export default treeScaleTuning;
