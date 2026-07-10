// B"H
import { createDoorWallSet } from './DoorWallSystem.js';
import { createFenceAlongPath } from './ProceduralFenceSystem.js';
import { exactRepeat, materialTexture, roofRepeat, wallRepeat } from '../assets/TextureRepeat.js';

export const DEFAULT_HOUSE_SPEC = Object.freeze({ id:'Awtsmoos-main-huge-house',x:52,z:-60,yaw:0,width:82,depth:68,wallH:25,wallT:.95,doorW:2.7,doorH:3,roofRise:10,roofOver:4.8,floors:3,fence:true,storyHeight:8.2 });
export const HOUSE_ROOM_KINDS = Object.freeze(['wash-house','far-family-house','side-study-house','small-courtyard-house','tall-learning-house','corner-guest-house']);

/** Every house begins by listening to the ground beneath all four corners. */
export function createModularHouse(assets = {}, spec = DEFAULT_HOUSE_SPEC, groundSampler) {
  const s=resolveSpec(spec,groundSampler),m=materials(assets,s),defs=[foundation(s,m),floor(s,m,0),backWall(s,m),leftWall(s,m),rightWall(s,m),frontDoorSet(assets,s).wall,roof(s,m),...entryStairs(s,m,groundSampler),...roomWalls(s,m)];
  if(s.floors>1) defs.push(storyFloor(s,m,1),...interiorStairs(s,m,0,1));
  if(s.floors>2) defs.push(storyFloor(s,m,2),...interiorStairs(s,m,1,2));
  if(s.fence&&groundSampler) defs.push(createFenceAlongPath({id:`${s.id}-measured-three-rail-fence`,path:fencePath(s),groundSampler,material:{...m.fence,backfaceCull:false,doubleSided:true}}));
  return defs;
}
export function modularHouseDoorDef(assets={},spec=DEFAULT_HOUSE_SPEC,groundSampler){return frontDoorSet(assets,resolveSpec(spec,groundSampler)).door;}
export function modularHouseDoorWorld(spec=DEFAULT_HOUSE_SPEC){const s={...DEFAULT_HOUSE_SPEC,...spec};return localToWorld(s,0,s.depth/2-s.wallT/2);}
export function modularHouseRoadStart(spec=DEFAULT_HOUSE_SPEC){const s={...DEFAULT_HOUSE_SPEC,...spec},p=localToWorld(s,0,s.depth/2+13);return{x:p.x,z:p.z};}
export function modularHouseAnchors(spec=DEFAULT_HOUSE_SPEC){const s={...DEFAULT_HOUSE_SPEC,...spec};return{id:s.id,frontDoor:modularHouseRoadStart(s),frontStairs:localToWorld(s,0,s.depth/2+7),insideFoyer:localToWorld(s,0,s.depth/2-6),hallCenter:localToWorld(s,0,0),backRoom:localToWorld(s,0,-s.depth/2+8),leftRoom:localToWorld(s,-s.width/2+10,0),rightRoom:localToWorld(s,s.width/2-10,0),upstairsHook:{...localToWorld(s,-s.width/2+10,s.depth/2-10),y:(s.floorY||0)+s.storyHeight}};}
export function createFutureHouseSpecs(base=DEFAULT_HOUSE_SPEC){const b={...DEFAULT_HOUSE_SPEC,...base};return[
{...b,id:'Awtsmoos-wash-house',x:-38,z:18,yaw:-.26,width:52,depth:40,wallH:18,floors:2,storyHeight:7.2},
{...b,id:'Awtsmoos-far-family-house',x:-100,z:48,yaw:.32,width:62,depth:45,wallH:22,floors:3,storyHeight:7.1},
{...b,id:'Awtsmoos-side-study-house',x:102,z:-18,yaw:-.22,width:56,depth:41,wallH:19,floors:2,storyHeight:7.4},
{...b,id:'Awtsmoos-courtyard-house',x:12,z:58,yaw:.18,width:48,depth:36,wallH:17,floors:2,storyHeight:6.8},
{...b,id:'Awtsmoos-tall-learning-house',x:-138,z:-22,yaw:.12,width:54,depth:40,wallH:23,floors:3,storyHeight:7.2},
{...b,id:'Awtsmoos-corner-guest-house',x:128,z:52,yaw:-.48,width:46,depth:35,wallH:16,floors:2,storyHeight:6.5}];}

function resolveSpec(spec,sampler){const s={...DEFAULT_HOUSE_SPEC,...spec};if(!sampler)return{...s,floorY:s.floorY??0};const corners=[[-s.width/2,-s.depth/2],[s.width/2,-s.depth/2],[-s.width/2,s.depth/2],[s.width/2,s.depth/2]].map(([x,z])=>{const p=localToWorld(s,x,z);return sampler.heightAt(p.x,p.z);});return{...s,floorY:Math.max(...corners.map(c=>c.y)),groundEvidence:corners.map(c=>c.source)};}
function frontDoorSet(assets,s){const p=modularHouseDoorWorld(s),m=materials(assets,s);return createDoorWallSet({id:`${s.id}-front`,wallId:`${s.id}-front-wall`,doorId:`${s.id}-front-door`,x:p.x,z:p.z,floorY:s.floorY,yaw:s.yaw,wallW:s.width,wallH:s.wallH,wallT:s.wallT,doorW:s.doorW,doorH:s.doorH,doorThickness:.24,panelGap:.08,doorDepth:s.wallT*.72,openAngle:Math.PI*.54,noEdge:true},{...m.wall,doorMaterial:m.door});}
function materials(a,s){const brick=a.whiteBrickImage||a.brickImage;return{wall:mat('#eee8d9',brick,wallRepeat(s.width,s.wallH)),side:mat('#eee8d9',brick,wallRepeat(s.depth,s.wallH)),stone:mat('#c7bea9',a.stoneImage,exactRepeat(s.width,s.depth,5,1,28)),door:mat('#a56432',a.woodImage,[2,3]),roof:mat('#8a5b35',a.woodImage,roofRepeat(s.width+s.roofOver*2,s.depth+s.roofOver*2)),fence:mat('#d8c0a0',a.woodImage,[2,1])};}
function mat(color,image,repeat){return materialTexture(color,image,repeat,{backfaceCull:true,fullResolution:true,hook:'modular-house'});}
function foundation(s,m){const depth=Math.max(.35,s.floorY-Math.min(...foundationGround(s)));return box(`${s.id}-measured-foundation`,m.stone,s,0,s.floorY-depth/2,0,s.width,depth,s.depth,true);}
function foundationGround(s){return [s.floorY,s.floorY,s.floorY,s.floorY];}
function floor(s,m,level){return box(`${s.id}-walkable-floor-${level+1}`,m.stone,s,0,s.floorY+.08+level*s.storyHeight,0,s.width-s.wallT*2,.18,s.depth-s.wallT*2,true);}
function storyFloor(s,m,level){return box(`${s.id}-story-${level+1}-platform`,m.stone,s,level%2?-s.width*.08:s.width*.08,s.floorY+level*s.storyHeight,-s.depth*.05,s.width*.7,.2,s.depth*.58,true);}
function backWall(s,m){return box(`${s.id}-back-wall`,m.wall,s,0,s.floorY+s.wallH/2,-s.depth/2+s.wallT/2,s.width,s.wallH,s.wallT);}
function leftWall(s,m){return box(`${s.id}-left-wall`,m.side,s,-s.width/2+s.wallT/2,s.floorY+s.wallH/2,0,s.wallT,s.wallH,s.depth-s.wallT*2);}
function rightWall(s,m){return box(`${s.id}-right-wall`,m.side,s,s.width/2-s.wallT/2,s.floorY+s.wallH/2,0,s.wallT,s.wallH,s.depth-s.wallT*2);}
function roomWalls(s,m){return[box(`${s.id}-room-divider-a`,m.side,s,-s.width*.16,s.floorY+s.storyHeight*.38,-s.depth*.08,s.wallT,s.storyHeight*.72,s.depth*.42),box(`${s.id}-room-divider-b`,m.wall,s,s.width*.18,s.floorY+s.storyHeight*.38,s.depth*.12,s.width*.28,s.storyHeight*.72,s.wallT)];}
function entryStairs(s,m,sampler){if(!sampler)return[];const baseLocal=s.depth/2+7.2,base=sampleLocal(s,sampler,0,baseLocal),rise=Math.max(.1,s.floorY-base.y),count=Math.max(4,Math.ceil(rise/.22)),stepD=.85,w=s.doorW+4.5,out=[];for(let i=0;i<count;i++){const t=i/(count-1),lz=baseLocal-i*stepD,here=sampleLocal(s,sampler,0,lz),top=here.y+(s.floorY-here.y)*t;out.push(box(`${s.id}-entry-step-${i+1}`,m.stone,s,0,top-.11,lz,w,.22,stepD,true));}out.push(box(`${s.id}-door-landing`,m.stone,s,0,s.floorY+.09,s.depth/2+.3,w+1,.18,2.3,true));return out;}
function interiorStairs(s,m,from,to){const start=s.floorY+from*s.storyHeight,end=s.floorY+to*s.storyHeight,steps=Math.max(10,Math.ceil((end-start)/.24)),out=[];for(let i=0;i<steps;i++){const t=(i+1)/steps;out.push(box(`${s.id}-inside-${from+1}-${to+1}-step-${i+1}`,m.stone,s,-s.width*.28+from*3,start+(end-start)*t-.13,s.depth*.24-i*.82,1.9,.26,1,true));}out.push(box(`${s.id}-inside-${to+1}-landing`,m.stone,s,-s.width*.28+from*3,end+.09,s.depth*.24-steps*.82,3,.18,2.2,true));return out;}
function roof(s,m){const hx=s.width/2+s.roofOver,hz=s.depth/2+s.roofOver,y=s.floorY+s.wallH,top=[0,y+s.roofRise,0],A=[-hx,y,hz],B=[hx,y,hz],C=[hx,y,-hz],D=[-hx,y,-hz];return manual(`${s.id}-hip-roof`,m.roof,s,[A,B,top,B,C,top,C,D,top,D,A,top],[0,1,2,3,4,5,6,7,8,9,10,11]);}
function fencePath(s){const p=8,w=s.width/2+p,d=s.depth/2+p;return[localToWorld(s,-w,-d),localToWorld(s,w,-d),localToWorld(s,w,d),localToWorld(s,-w,d)];}
function sampleLocal(s,sampler,x,z){const p=localToWorld(s,x,z),sample=sampler.heightAt(p.x,p.z);return{...p,y:sample.y,sample};}
function box(id,material,s,lx,y,lz,sx,sy,sz,walkable=false){const p=localToWorld(s,lx,lz);return{id,shape:'box',solid:true,walkable,noEdge:true,...material,position:{x:p.x,y,z:p.z},size:{x:sx,y:sy,z:sz},rotation:{y:s.yaw}};}
function manual(id,material,s,vertices,faces){return{id,shape:'manual',solid:true,walkable:false,noEdge:true,...material,position:{x:s.x,y:0,z:s.z},vertices,faces:faces.reduce((a,_,i)=>i%3?a:(a.push([i,i+1,i+2]),a),[]),uvs:new Array(vertices.length*2).fill(0),rotation:{y:s.yaw},yaw:s.yaw};}
function localToWorld(s,x,z){const c=Math.cos(s.yaw),q=Math.sin(s.yaw);return{x:s.x+x*c-z*q,z:s.z+x*q+z*c};}
