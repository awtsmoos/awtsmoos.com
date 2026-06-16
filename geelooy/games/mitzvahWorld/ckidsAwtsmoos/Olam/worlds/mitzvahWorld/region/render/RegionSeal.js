// B"H
/**
 * @file RegionSeal.js
 * @description A parser-clear seal: visuals never become walls, colliders never pretend to be grass.
 */
const VISUAL = Object.freeze({ regionVisual:true, skipOctree:true, noOctree:true, skipRaycast:true, addToOctree:false });
const HARD = Object.freeze({ regionCollider:true, isSolid:true, addToOctree:true, skipOctree:false, noOctree:false });
function data(node) { if (!node.userData) node.userData = {}; return node.userData; }
function visit(root, callback) { if (root && typeof root.traverse === "function") root.traverse(callback); else if (root) callback(root); }
function apply(node, flags, extra) { Object.assign(data(node), flags, extra); }
export function sealRegionVisual(root, extra = {}) {
  if (!root) return root;
  visit(root, child => apply(child, VISUAL, extra));
  apply(root, VISUAL, extra);
  return root;
}
export function sealHardCollider(root, extra = {}) {
  if (!root) return root;
  visit(root, child => apply(child, HARD, extra));
  apply(root, HARD, extra);
  return root;
}
export function unsealForExplicitInteraction(root, extra = {}) {
  if (!root) return root;
  visit(root, child => Object.assign(data(child), { skipRaycast:false, interactionLayer:"explicit-interaction" }, extra));
  return root;
}
