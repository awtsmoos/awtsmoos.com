// B"H
/** @file treeRecipe.js @description Village picture trees route only through the procedural-core tree gateway. */
import { buildAdvancedTree, markApprovedTree } from "../../../Olam/worlds/mitzvahWorld/region/render/AdvancedTreeOnly.js?v=exclusive-procedural-core-tree-20260614-bh3";
function contextOf(options) { return options && options.context ? options.context : options && options.olam ? options.olam : null; }
function n(value, fallback = 0) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
function optionsFor(input = {}) { return { name:input.name || "pictureAnchorTree_procedural_core_only", kind:input.kind || input.species || "oak", x:n(input.x, 0), y:n(input.y, 0), z:n(input.z, 0), groundY:n(input.groundY, 0), groundLift:n(input.groundLift, .01), rotationY:n(input.rotationY, 0), scale:n(input.scale, 1), age:input.age || "ancient" }; }
export function pictureAnchorTree(options = {}) { const tree = buildAdvancedTree(contextOf(options), optionsFor(options), n(options.variant, 0)); tree.name = options.name || "pictureAnchorTree_procedural_core_only"; return markApprovedTree(tree); }
