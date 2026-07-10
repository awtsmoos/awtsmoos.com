// B"H
import { entryRightJambWorld,normalizeDoorFrame } from './HouseDoorGeometry.js';

/** A measured mezuzah case rests on the right jamb as one enters the house. */
export function createMezuzaDef(spec,material={}){
  const frame=normalizeDoorFrame(spec),caseWidth=.13,caseHeight=Math.min(.78,frame.doorH*.29),caseDepth=.10;
  const p=entryRightJambWorld(frame,caseWidth*.9);
  return{
    id:`${frame.doorId}-mezuza`,shape:'box',solid:false,walkable:false,noEdge:true,
    color:material.color||'#b58a28',mapImage:material.mapImage||null,textureUrl:material.textureUrl||null,
    mapRepeat:[1,1],position:{x:p.x,y:frame.floorY+frame.doorH*.67,z:p.z},
    size:{x:caseWidth,y:caseHeight,z:caseDepth},rotation:{y:frame.yaw,z:-.10},
    userData:{AwtsmoosMezuza:{doorId:frame.doorId,jamb:'entry-right',hingeSide:frame.hingeSide,entryDirection:frame.entryDirection,yaw:frame.yaw}}
  };
}
