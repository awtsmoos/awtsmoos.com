// B"H
/** @file WeaponPosePlanRuntime.js @description Converts custom action phases into bone-target pose plans for the chossid rig. */
const MAP=Object.freeze({ right:["mixamorig:RightShoulder","mixamorig:RightArm","mixamorig:RightForeArm","mixamorig:RightHand"], left:["mixamorig:LeftShoulder","mixamorig:LeftArm","mixamorig:LeftForeArm","mixamorig:LeftHand"], spine:["mixamorig:Spine","mixamorig:Spine1","mixamorig:Spine2"] });
function targetsFor(phase){ const out=[]; for(const [side,bones] of Object.entries(MAP)){ const pose=phase.bones?.[side]; if(pose) out.push(...bones.map(bone=>({bone,pose,side}))); } return out; }
export function posePlanForAction(action,item={}){ const phases=(action.phases||[]).map((phase,index)=>({...phase,index,targets:targetsFor(phase)})); return {id:`pose_${item.id||"hands"}_${action.id}`,itemId:item.id,actionId:action.id,clip:action.clip,handMode:action.handMode,hitPhase:action.hitPhase,usesRightHand:phases.some(p=>p.targets.some(t=>t.side==="right")),usesLeftHand:phases.some(p=>p.targets.some(t=>t.side==="left")),phases,durationMs:phases.reduce((n,p)=>n+p.ms,0),generated:true}; }
export default posePlanForAction;
