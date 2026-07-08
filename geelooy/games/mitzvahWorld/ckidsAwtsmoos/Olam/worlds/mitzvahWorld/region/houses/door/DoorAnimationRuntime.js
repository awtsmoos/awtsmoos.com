// B"H
/** @file DoorAnimationRuntime.js @description Door visual state applies immediately and may still ease afterward. */
function eachDoor(root,fn){root?.traverse?.(child=>{if(child.userData?.doorHingePivot)fn(child,child.userData.doorState);});}
function angleFor(door){return door?.open?(door.hinge==="left"?-1.5:1.5):0;}
export function setDoorVisualState(root,doorId,state={}){let changed=0;eachDoor(root,(pivot,door)=>{if(door?.id!==doorId)return;Object.assign(door,state);door.targetAngle=angleFor(door);door.angle=door.targetAngle;pivot.rotation.y=door.angle;pivot.updateMatrixWorld?.(true);door.animationStartedAt=Date.now();pivot.userData.doorOpen=door.open===true;changed++;});return changed;}
export function updateDoorAnimations(root,dt=1/60){const speed=Math.min(1,Math.max(.02,dt*9));eachDoor(root,(pivot,door)=>{door.targetAngle=angleFor(door);door.angle=Number(door.angle||0)+(Number(door.targetAngle||0)-Number(door.angle||0))*speed;pivot.rotation.y=door.angle;});}
export default{setDoorVisualState,updateDoorAnimations};
