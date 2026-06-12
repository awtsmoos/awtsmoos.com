// B"H
/** @file RegionSeal.js @description Seals region visuals away from octree and raycast. */
export function sealRegionVisual(root, extra = {}) {
  root?.traverse?.(child => Object.assign(child.userData ||= {}, { regionVisual: true, skipOctree: true, noOctree: true, skipRaycast: true, addToOctree: false, ...extra }));
  Object.assign(root.userData ||= {}, { regionVisual: true, skipOctree: true, noOctree: true, skipRaycast: true, addToOctree: false, ...extra });
  return root;
}
export function sealHardCollider(root, extra = {}) {
  root?.traverse?.(child => Object.assign(child.userData ||= {}, { regionCollider: true, isSolid: true, addToOctree: true, skipOctree: false, noOctree: false, ...extra }));
  Object.assign(root.userData ||= {}, { regionCollider: true, isSolid: true, addToOctree: true, skipOctree: false, noOctree: false, ...extra });
  return root;
}
