// B"H
/** @file HandBoneResolver.js @description Resolves the true palm before fingers or forearm fallbacks. */
const RIGHT_NAMES=["mixamorig:RightHand","RightHand","rightHand","mixamorigRightHand","mixamorig:RightHandMiddle1","mixamorig:RightHandIndex1","mixamorig:RightForeArm"];
const LEFT_NAMES=["mixamorig:LeftHand","LeftHand","leftHand","mixamorigLeftHand","mixamorig:LeftHandMiddle1","mixamorig:LeftHandIndex1","mixamorig:LeftForeArm"];
function collect(root){ const nodes=[]; root?.traverse?.(node=>nodes.push(node)); return nodes; }
function findByPriority(root,names){ const nodes=collect(root); for(const name of names){ const found=nodes.find(node=>node.name===name); if(found) return found; } return null; }
function fuzzy(root,side){ const nodes=collect(root), palm=new RegExp(`mixamorig:${side}Hand$|^${side}Hand$`,"i"), any=new RegExp(`${side}.*(Hand|Index1|Middle1|ForeArm)`,"i"); return nodes.find(node=>palm.test(node.name||""))||nodes.find(node=>any.test(node.name||""))||null; }
export function resolveHandBone(root,side="right"){ const cap=side==="left"?"Left":"Right", names=side==="left"?LEFT_NAMES:RIGHT_NAMES, exact=findByPriority(root,names), bone=exact||fuzzy(root,cap); return {ok:Boolean(bone),side,bone,name:bone?.name||null,strategy:exact?"exact-priority":bone?"fuzzy":"missing"}; }
export default resolveHandBone;
