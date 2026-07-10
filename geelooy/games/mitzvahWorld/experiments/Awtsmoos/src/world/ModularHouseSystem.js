// B"H
import { createDoorWallSet } from './DoorWallSystem.js';
import { createFenceAlongPath } from './ProceduralFenceSystem.js';
import { createInteriorRoomSet } from './InteriorRoomSystem.js';
import { createMezuzaDef } from './MezuzaSystem.js';
import { createStoryFloorPieces,stairwellOpening } from './StoryFloorSystem.js';
import { materialTexture,REPEAT_HOOKS } from '../assets/TextureRepeat.js';

export const DEFAULT_HOUSE_SPEC=Object.freeze({id:'Awtsmoos-main-house',x:58,z:-64,yaw:0,width:60,depth:46,wallH:17,wallT:.9,doorW:2.7,doorH:3,roofRise:7,roofOver:3.4,floors:2,fence:true,storyHeight:7.4});
export const HOUSE_ROOM_KINDS=Object.freeze(['main-house','west-learning-house','east-family-house','north-study-house','south-guest-house']);

/** A measured house with real floor openings, doorway walls, and a front fence gate. */
export function createModularHouse(assets={},spec=DEFAULT_HOUSE_SPEC,groundSampler){
  const s=resolveSpec(spec,groundSampler),m=materials(assets),front=frontDoorSet(assets,s),rooms=createInteriorRoomSet({spec:s,materials:m,localToWorld});
  const defs=[foundation(s,m),floor(s,m,0),backWall(s,m),leftWall(s,m),rightWall(s,m),front.wall,createMezuzaDef(front.spec,m.mezuza),roof(s,m),...entryStairs(s,m,groundSampler),...rooms.staticDefs];
  if(s.floors>1)defs.push(...createStoryFloorPieces({spec:s,material:m.stone,level:1,box}),...interiorStairs(s,m,0,1));
  if(s.floors>2)defs.push(...createStoryFloorPieces({spec:s,material:m.stone,level:2,box}),...interiorStairs(s,m,1,2));
  if(s.fence&&groundSampler)defs.push(...createFenceAlongPath({id:`${s.id}-measured-fence`,segments:fenceSegments(s),groundSampler,material:{...m.fence,doubleSided:true}}));
  defs.userData={doorDefs:[front.door,...rooms.doorDefs]};
  return defs;
}
export function modularHouseDoorDefs(assets={},spec=DEFAULT_HOUSE_SPEC,groundSampler){const s=resolveSpec(spec,groundSampler),front=frontDoorSet(assets,s),rooms=createInteriorRoomSet({spec:s,materials:materials(assets),localToWorld});return[front.door,...rooms.doorDefs];}
export function modularHouseDoorDef(assets={},spec=DEFAULT_HOUSE_SPEC,groundSampler){return modularHouseDoorDefs(assets,spec,groundSampler)[0];}
export function modularHouseDoorWorld(spec=DEFAULT_HOUSE_SPEC){const s={...DEFAULT_HOUSE_SPEC,...spec};return localToWorld(s,0,s.depth/2-s.wallT/2);}
export function modularHouseRoadStart(spec=DEFAULT_HOUSE_SPEC){const s={...DEFAULT_HOUSE_SPEC,...spec},p=localToWorld(s,0,s.depth/2+10);return{x:p.x,z:p.z};}
export function modularHouseAnchors(spec=DEFAULT_HOUSE_SPEC){const s={...DEFAULT_HOUSE_SPEC,...spec};return{id:s.id,frontDoor:modularHouseRoadStart(s),frontStairs:localToWorld(s,0,s.depth/2+5.5),insideFoyer:localToWorld(s,0,s.depth/2-5),hallCenter:localToWorld(s,0,0),backRoom:localToWorld(s,0,-s.depth/2+7),leftRoom:localToWorld(s,-s.width/2+8,0),rightRoom:localToWorld(s,s.width/2-8,0),upstairsHook:{...localToWorld(s,-s.width*.24,s.depth*.2-8*.82),y:(s.floorY||0)+s.storyHeight}};}
export function createFutureHouseSpecs(base=DEFAULT_HOUSE_SPEC){const b={...DEFAULT_HOUSE_SPEC,...base};return[
{...b,id:'Awtsmoos-west-learning-house',x:-88,z:62,yaw:.18,width:46,depth:34,wallH:15,floors:2,storyHeight:6.6},
{...b,id:'Awtsmoos-east-family-house',x:118,z:50,yaw:-.22,width:48,depth:36,wallH:16,floors:2,storyHeight:6.8},
{...b,id:'Awtsmoos-north-study-house',x:-94,z:-72,yaw:-.12,width:44,depth:32,wallH:14,floors:2,storyHeight:6.3},
{...b,id:'Awtsmoos-south-guest-house',x:160,z:-112,yaw:.16,width:42,depth:31,wallH:13,floors:1,storyHeight:6.2}
];}
function resolveSpec(spec,sampler){const s={...DEFAULT_HOUSE_SPEC,...spec};if(!sampler)return{...s,floorY:s.floorY??0,groundMin:s.floorY??0};const samples=[[-s.width/2,-s.depth/2],[s.width/2,-s.depth/2],[-s.width/2,s.depth/2],[s.width/2,s.depth/2]].map(([x,z])=>{const p=localToWorld(s,x,z);return sampler.heightAt(p.x,p.z);});return{...s,floorY:Math.max(...samples.map(v=>v.y)),groundMin:Math.min(...samples.map(v=>v.y)),groundEvidence:samples.map(v=>v.source)};}
function frontDoorSet(assets,s){const p=modularHouseDoorWorld(s),m=materials(assets);return createDoorWallSet({id:`${s.id}-front`,wallId:`${s.id}-front-wall`,doorId:`${s.id}-front-door`,x:p.x,z:p.z,floorY:s.floorY,yaw:s.yaw,wallW:s.width,wallH:s.wallH,wallT:s.wallT,doorW:s.doorW,doorH:s.doorH,doorThickness:.24,panelGap:.08,openAngle:Math.PI*.54,noEdge:true},{...m.wall,doorMaterial:m.door});}
function materials(a){return{wall:mat('#eee8d9',a.whiteBrickImage||a.brickImage,REPEAT_HOOKS.wallTileWorld),side:mat('#eee8d9',a.whiteBrickImage||a.brickImage,REPEAT_HOOKS.wallTileWorld),stone:mat('#c7bea9',a.stoneImage,REPEAT_HOOKS.floorTileWorld),door:mat('#7d4827',a.woodImage,2),roof:mat('#8a5b35',a.woodImage,REPEAT_HOOKS.roofTileWorld),fence:mat('#d8c0a0',a.woodImage,2),mezuza:mat('#b58a28',a.goldImage||a.woodImage,.5)};}
function mat(color,image,tileWorld){return materialTexture(color,image,[1,1],{backfaceCull:true,tileWorld,projection:'cube-world',hook:'modular-house'});}
function foundation(s,m){const depth=Math.max(.35,s.floorY-s.groundMin+.2);return box(`${s.id}-measured-foundation`,m.stone,s,0,s.floorY-depth/2,0,s.width,depth,s.depth,true);}
function floor(s,m,level){return box(`${s.id}-floor-${level+1}`,m.stone,s,0,s.floorY+.08+level*s.storyHeight,0,s.width-s.wallT*2,.18,s.depth-s.wallT*2,true);}
function backWall(s,m){return box(`${s.id}-back-wall`,m.wall,s,0,s.floorY+s.wallH/2,-s.depth/2+s.wallT/2,s.width,s.wallH,s.wallT);}
function leftWall(s,m){return box(`${s.id}-left-wall`,m.side,s,-s.width/2+s.wallT/2,s.floorY+s.wallH/2,0,s.wallT,s.wallH,s.depth-s.wallT*2);}
function rightWall(s,m){return box(`${s.id}-right-wall`,m.side,s,s.width/2-s.wallT/2,s.floorY+s.wallH/2,0,s.wallT,s.wallH,s.depth-s.wallT*2);}
function entryStairs(s,m,sampler){if(!sampler)return[];const baseZ=s.depth/2+5.4,base=sampleLocal(s,sampler,0,baseZ),rise=Math.max(.08,s.floorY-base.y),count=Math.max(3,Math.min(6,Math.ceil(rise/.28))),stepD=.9,w=s.doorW+3.6,out=[];for(let i=0;i<count;i++){const t=i/(count-1),lz=baseZ-i*stepD,here=sampleLocal(s,sampler,0,lz),top=here.y+(s.floorY-here.y)*t;out.push(box(`${s.id}-entry-step-${i+1}`,m.stone,s,0,top-.12,lz,w,.24,stepD,true));}out.push(box(`${s.id}-door-landing`,m.stone,s,0,s.floorY+.09,s.depth/2+.25,w+.8,.18,2,true));return out;}
function interiorStairs(s,m,from,to){const start=s.floorY+from*s.storyHeight,end=s.floorY+to*s.storyHeight,steps=8,opening=stairwellOpening(s,to),startZ=s.depth*.2,out=[];for(let i=0;i<steps;i++){const t=(i+1)/steps,lz=startZ+(opening.centerZ-startZ)*t;out.push(box(`${s.id}-inside-${from+1}-${to+1}-${i+1}`,m.stone,s,opening.centerX,start+(end-start)*t-.14,lz,1.8,.28,1,true));}out.push(box(`${s.id}-inside-${to+1}-landing`,m.stone,s,opening.centerX,end+.09,opening.centerZ,opening.width-.4,.18,opening.depth-.4,true));return out;}
function roof(s,m){const hx=s.width/2+s.roofOver,hz=s.depth/2+s.roofOver,y=s.floorY+s.wallH,top=[0,y+s.roofRise,0],A=[-hx,y,hz],B=[hx,y,hz],C=[hx,y,-hz],D=[-hx,y,-hz],vertices=[A,B,top,B,C,top,C,D,top,D,A,top],uvs=vertices.flatMap(p=>[p[0]/REPEAT_HOOKS.roofTileWorld,p[2]/REPEAT_HOOKS.roofTileWorld]);return{id:`${s.id}-hip-roof`,shape:'manual',solid:false,walkable:false,noEdge:true,...m.roof,position:{x:s.x,y:0,z:s.z},vertices,faces:[[0,1,2],[3,4,5],[6,7,8],[9,10,11]],uvs,rotation:{y:s.yaw},yaw:s.yaw};}
function fenceSegments(s){const pad=5,w=s.width/2+pad,d=s.depth/2+pad,gap=Math.max(5.2,s.doorW+3.2);const bl=localToWorld(s,-w,-d),br=localToWorld(s,w,-d),fr=localToWorld(s,w,d),fl=localToWorld(s,-w,d),gateL=localToWorld(s,-gap/2,d),gateR=localToWorld(s,gap/2,d);return[[bl,br],[br,fr],[fr,gateR],[gateL,fl],[fl,bl]];}
function sampleLocal(s,sampler,x,z){const p=localToWorld(s,x,z),sample=sampler.heightAt(p.x,p.z);return{...p,y:sample.y,sample};}
function box(id,material,s,lx,y,lz,sx,sy,sz,walkable=false){const p=localToWorld(s,lx,lz);return{id,shape:'box',solid:true,walkable,noEdge:true,...material,position:{x:p.x,y,z:p.z},size:{x:sx,y:sy,z:sz},rotation:{y:s.yaw}};}
function localToWorld(s,x,z){const c=Math.cos(s.yaw),q=Math.sin(s.yaw);return{x:s.x+x*c-z*q,z:s.z+x*q+z*c};}
