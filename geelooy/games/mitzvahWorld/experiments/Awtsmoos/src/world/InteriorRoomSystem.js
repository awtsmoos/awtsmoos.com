// B"H
import { createDoorWallSet } from './DoorWallSystem.js';
import { createMezuzaDef } from './MezuzaSystem.js';

/** Interior partitions are real doorway walls with matching doors and mezuzahs. */
export function createInteriorRoomSet({spec,materials,localToWorld}){
  const wallZ=spec.depth*.10,p=localToWorld(spec,0,wallZ),doorSpec={
    id:`${spec.id}-interior-room`,wallId:`${spec.id}-interior-room-wall`,doorId:`${spec.id}-interior-room-door`,
    x:p.x,z:p.z,floorY:spec.floorY,yaw:spec.yaw,wallW:spec.width*.62,wallH:Math.min(spec.storyHeight*.82,5.8),wallT:spec.wallT,
    doorW:2.5,doorH:2.8,doorThickness:.20,panelGap:.08,openAngle:Math.PI*.52,noEdge:true
  };
  const set=createDoorWallSet(doorSpec,{...materials.wall,doorMaterial:materials.door});
  return{staticDefs:[set.wall,createMezuzaDef(doorSpec,materials.mezuza)],doorDefs:[set.door]};
}
