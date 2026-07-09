// B"H
/** @file treeRecipe.js @description Sanitized picture anchor tree recipe routed through the guarded core factory. */
import { buildAdvancedTree, markApprovedTree } from "../../../Olam/worlds/mitzvahWorld/region/render/AdvancedTreeOnly.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const contextOf = o => o?.context || o?.olam || null;
function opts(input = {}) { return { name:input.name || "pictureAnchorTree_textured_procedural_core", kind:input.kind || input.species || "oak", x:n(input.x, n(input.position?.x)), y:n(input.y, n(input.position?.y)), z:n(input.z, n(input.position?.z)), groundY:n(input.groundY), groundLift:n(input.groundLift, .015), rotationY:n(input.rotationY, n(input.rotation?.y)), scale:Math.max(.25, n(input.scale, .9)), age:input.age || "mature", sourcePath:"villagePicture/treeRecipe.pictureAnchorTree" }; }
export function pictureAnchorTree(options = {}) { const tree = buildAdvancedTree(contextOf(options), opts(options), n(options.variant)); tree.name = options.name || "pictureAnchorTree_textured_procedural_core"; Object.assign(tree.userData ||= {}, { pictureAnchorTree:true, fullAboveGround:true, realBarkAndLeafTextures:true }); return markApprovedTree(tree); }
