// B"H
/** @file FenceColliderPlan.js @description Explicit fence post/rail source records, never broad invisible fences. */
export function fenceColliderSources(root) { const out = []; root?.traverse?.(child => { const data = child.userData || {}; if (!data.fenceSegment && !data.fencePost && !/fence/i.test(child.name || "")) return; const wp = child.getWorldPosition ? child.getWorldPosition(child.position.clone()) : child.position; out.push({ id:`fence_${out.length}`, category:data.fencePost ? "fence-post" : "fence-rail", owner:child.name || "fence", position:[wp.x, .7, wp.z], size:data.colliderSize || [.18,1.2,1.0], yaw:child.rotation?.y || 0, visibleTwin:child.name || "fence" }); }); return out; }
export default fenceColliderSources;
