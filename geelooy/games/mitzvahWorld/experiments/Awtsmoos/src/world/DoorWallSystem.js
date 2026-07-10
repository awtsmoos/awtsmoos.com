// B"H
import { doorPanelDepth,normalizeDoorFrame } from './HouseDoorGeometry.js';

/** One normalized frame produces the wall opening and the matching hinged panel. */
export function createDoorWallSet(spec,material={}){const frame=normalizeDoorFrame(spec);return{wall:doorWallDef(frame,material),door:doorDefFromWall(frame,material.doorMaterial||{}),spec:frame};}
export function doorWallDef(spec,material={}){
  const s=normalizeDoorFrame(spec);
  return{id:s.wallId,shape:'doorway',solid:true,walkable:false,noEdge:!!s.noEdge,color:material.color||s.wallColor,mapImage:material.mapImage||null,textureUrl:material.textureUrl||material.mapImage?.dataset?.url||material.mapImage?.src||null,mapRepeat:material.mapRepeat||[1,1],anisotropy:material.anisotropy??2,backfaceCull:!!material.backfaceCull,texturePolicy:material.texturePolicy||null,position:{x:s.x,y:s.floorY+s.wallH/2,z:s.z},size:{x:s.wallW,y:s.wallH,z:s.wallT},door:{x:s.doorW,y:s.doorH},yaw:s.yaw,rotation:{y:s.yaw},userData:{AwtsmoosDoorWallSpec:s}};
}
export function doorDefFromWall(spec,material={}){
  const s=normalizeDoorFrame(spec),gap=s.panelGap;
  return{id:s.doorId,position:{x:s.x,y:0,z:s.z},yaw:s.yaw,width:s.doorW-gap,height:s.doorH-gap,thickness:s.doorThickness,centerY:s.floorY+(s.doorH-gap)/2,depth:doorPanelDepth(s),openAngle:s.openAngle,hingeSide:s.hingeSide,entryDirection:s.entryDirection,opening:{width:s.doorW,height:s.doorH,wall:s.wallId},color:material.color||s.doorColor,mapImage:material.mapImage||null,textureUrl:material.textureUrl||material.mapImage?.dataset?.url||material.mapImage?.src||null,mapRepeat:material.mapRepeat||[1,1],anisotropy:material.anisotropy??2,backfaceCull:!!material.backfaceCull,texturePolicy:material.texturePolicy||null,userData:{AwtsmoosDoorWallSpec:s}};
}
export const normalize=normalizeDoorFrame;
