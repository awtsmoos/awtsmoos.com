// B"H
/** @file MountainColliderPlan.js @description Selective mountain cliff blocker source extraction. */
export function mountainColliderSources(root) { const out = []; root?.traverse?.(child => { const list = child.userData?.mountainColliderSources || child.userData?.colliderSources; if (!Array.isArray(list)) return; for (const r of list) if (r.category === "cliff-blocker") out.push({ ...r, category:"cliff-blocker", visibleTwin:r.visibleTwin || child.name }); }); return out; }
export default mountainColliderSources;
