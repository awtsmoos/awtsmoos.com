// B"H
/** @file treeRecipe.js @description Textured grounded two-draw picture tree. The authored scene scale is honored; the Awtsmoos does not inflate it in secret. */
import { buildAdvancedTree, markApprovedTree } from "../../../Olam/worlds/mitzvahWorld/region/render/AdvancedTreeOnly.js?compact=true&v=fps-door-target-idle-20260708-bh1";
const contextOf=o=>o?.context||o?.olam||null;
const n=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
function opts(input={}){return{name:input.name||"pictureAnchorTree_textured_procedural_core",kind:input.kind||input.species||"oak",x:n(input.x,n(input.position?.x,0)),y:n(input.y,n(input.position?.y,0)),z:n(input.z,n(input.position?.z,0)),groundY:n(input.groundY,0),groundLift:n(input.groundLift,.015),rotationY:n(input.rotationY,n(input.rotation?.y,0)),scale:n(input.scale,.9),age:input.age||"mature"};}
export function pictureAnchorTree(options={}){const tree=buildAdvancedTree(contextOf(options),opts(options),n(options.variant,0));tree.name=options.name||"pictureAnchorTree_textured_procedural_core";tree.userData.pictureAnchorTree=true;tree.userData.fullAboveGround=true;tree.userData.realBarkAndLeafTextures=true;return markApprovedTree(tree);}
