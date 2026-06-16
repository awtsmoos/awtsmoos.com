// B"H
/** @file TreeShapePostProcess.js @description Tree foliage upgrade hook without optional-chain syntax. */
function messageOf(error) { return error && error.message ? error.message : String(error); }
function mark(node) { if (!node.userData) node.userData = {}; node.userData.treePostProcessed = true; node.userData.skipOctree = true; node.userData.noOctree = true; }
export function postProcessTreeShape(root) { try { if (root && typeof root.traverse === "function") root.traverse(mark); else if (root) mark(root); return root; } catch (error) { console.warn(`B"H | TREE_FOLIAGE_UPGRADE_ERROR | message=${messageOf(error)}`); return root; } }
export default postProcessTreeShape;
