// B"H
/** @file TreeTrunkColliderPlan.js @description Cylinder-ish tree trunk collider source planning. */
export function treeTrunkColliderSources(root) { const out = []; root?.traverse?.(child => { const data = child.userData || {}; if (!data.treeTrunk && !/trunk/i.test(child.name || "")) return; const wp = child.getWorldPosition ? child.getWorldPosition(child.position.clone()) : child.position; out.push({ id:`tree_trunk_${out.length}`, category:"tree-trunk", owner:child.name || "tree", position:[wp.x, 1, wp.z], radius:Number(data.trunkRadius || .38), height:Number(data.trunkHeight || 2.2), visibleTwin:child.name || "tree-trunk" }); }); return out; }
export default treeTrunkColliderSources;
