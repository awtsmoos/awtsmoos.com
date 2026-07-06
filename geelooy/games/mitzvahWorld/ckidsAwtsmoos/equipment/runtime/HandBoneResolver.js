// B"H
/** @file HandBoneResolver.js @description Finds the palm where the visible vessel must cling. */
const RIGHT_NAMES = ["mixamorig:RightHand","RightHand","rightHand","mixamorigRightHand","mixamorig:RightHandIndex1","mixamorig:RightHandMiddle1","mixamorig:RightForeArm"];
const LEFT_NAMES = ["mixamorig:LeftHand","LeftHand","leftHand","mixamorigLeftHand","mixamorig:LeftHandIndex1","mixamorig:LeftHandMiddle1","mixamorig:LeftForeArm"];
function findByName(root, names) { let found = null; root?.traverse?.(node => { if (!found && names.includes(node.name)) found = node; }); return found; }
function fuzzy(root, side) { const re = new RegExp(`${side}.*(Hand|Index1|Middle1|ForeArm)`, "i"); let found = null; root?.traverse?.(node => { if (!found && re.test(node.name || "")) found = node; }); return found; }
export function resolveHandBone(root, side = "right") { const names = side === "left" ? LEFT_NAMES : RIGHT_NAMES; const exact = findByName(root, names); const bone = exact || fuzzy(root, side); return { ok:Boolean(bone), side, bone, name:bone?.name || null, strategy:exact ? "exact" : bone ? "fuzzy" : "missing" }; }
export default resolveHandBone;
