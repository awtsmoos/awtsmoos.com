// B"H
import { createDoorWallSet } from './DoorWallSystem.js';
import { exactRepeat, materialTexture, roofRepeat, wallRepeat } from '../assets/TextureRepeat.js';
export const DEFAULT_HOUSE_SPEC = Object.freeze({ id:'Awtsmoos-main-huge-house', x:48, z:-58, yaw:0, floorY:1.05, width:53.4, depth:43.2, wallH:17.7, wallT:.82, doorW:2.45, doorH:2.75, roofRise:8.2, roofOver:3.2, staticDoor:false });
export const HOUSE_ROOM_KINDS = Object.freeze(['wash-house','far-family-house','side-study-house','small-courtyard-house']);

/** ModularHouseSystem: roofs are face-duplicated, UV-clean, and lit by sane normals. */
export function createModularHouse(assets = {}, spec = DEFAULT_HOUSE_SPEC) {
  const s=houseSpec(spec), mats=houseMaterials(assets,s), front=frontDoorSet(assets,s).wall, defs=[foundation(s,mats), floor(s,mats), backWall(s,mats), leftWall(s,mats), rightWall(s,mats), front, roof(s,mats), landing(s,mats), ramp(s,mats), stairMark(s,mats,1), stairMark(s,mats,2)];
  if (s.staticDoor) defs.push(staticDoor(s,mats));
  return defs;
}
export function modularHouseDoorDef(assets = {}, spec = DEFAULT_HOUSE_SPEC) { return frontDoorSet(assets, houseSpec(spec)).door; }
export function modularHouseDoorWorld(spec = DEFAULT_HOUSE_SPEC) { const s=houseSpec(spec); return localToWorld(s,0,s.depth/2-s.wallT/2); }
export function modularHouseRoadStart(spec = DEFAULT_HOUSE_SPEC) { const s=houseSpec(spec), p=localToWorld(s,0,s.depth/2+9.8); return { x:p.x, z:p.z }; }
export function modularHouseAnchors(spec = DEFAULT_HOUSE_SPEC) { const s=houseSpec(spec); return { id:s.id, frontDoor:modularHouseRoadStart(s), frontStairs:localToWorld(s,0,s.depth/2+4.8), insideFoyer:localToWorld(s,0,s.depth/2-4.5), hallCenter:localToWorld(s,0,0), backRoom:localToWorld(s,0,-s.depth/2+6), leftRoom:localToWorld(s,-s.width/2+7,0), rightRoom:localToWorld(s,s.width/2-7,0), upstairsHook:{ ...localToWorld(s,-s.width/2+8,s.depth/2-8), y:s.floorY+3.4 } }; }
export function createFutureHouseSpecs(base = DEFAULT_HOUSE_SPEC) { const b=houseSpec(base); return [
  { ...b, id:'Awtsmoos-wash-house', x:-30, z:16, yaw:-.26, floorY:.58, width:23, depth:17, wallH:8.4, roofRise:3.1, roofOver:1.4, staticDoor:true },
  { ...b, id:'Awtsmoos-far-family-house', x:-70, z:34, yaw:.32, floorY:.68, width:30, depth:22, wallH:9.6, roofRise:3.7, roofOver:1.8, staticDoor:true },
  { ...b, id:'Awtsmoos-side-study-house', x:75, z:-12, yaw:-.22, floorY:.62, width:25, depth:18, wallH:8.8, roofRise:3.4, roofOver:1.5, staticDoor:true },
  { ...b, id:'Awtsmoos-courtyard-house', x:8, z:34, yaw:.18, floorY:.52, width:18, depth:14, wallH:7.4, roofRise:2.8, roofOver:1.2, staticDoor:true }
]; }
function frontDoorSet(assets,s) { const p=modularHouseDoorWorld(s), mats=houseMaterials(assets,s); return createDoorWallSet({ id:`${s.id}-front`, wallId:`${s.id}-front-white-brick-door-wall`, doorId:`${s.id}-front-outside-flush-door`, x:p.x, z:p.z, floorY:s.floorY, yaw:s.yaw, wallW:s.width, wallH:s.wallH, wallT:s.wallT, doorW:s.doorW, doorH:s.doorH, doorThickness:.24, panelGap:.08, doorDepth:s.wallT/2+.18, openAngle:Math.PI*.54, noEdge:true, wallColor:'#eee8d9', doorColor:'#9a5827' }, { ...mats.wall, doorMaterial:mats.door }); }
function houseSpec(o) { return { ...DEFAULT_HOUSE_SPEC, ...o }; }
function houseMaterials(assets,s) { const brick=assets.whiteBrickImage||assets.brickImage; return { wall:mat('#eee8d9',brick,wallRepeat(s.width,s.wallH),false,true), side:mat('#eee8d9',brick,wallRepeat(s.depth,s.wallH),false,true), stoneImage:assets.stoneImage, woodImage:assets.woodImage, door:mat('#a56432',assets.woodImage,[2,3],true,true), roof:mat('#b88a5d',assets.woodImage,roofRepeat(s.width+s.roofOver*2,s.depth+s.roofOver*2),false,true) }; }
function mat(color,image,repeat,anisotropy,backfaceCull) { return materialTexture(color,image,repeat,{ anisotropy, backfaceCull, tileWorld:'visual-panel-original-resolution', hook:'modular-house' }); }
function stone(m,w,d,tile=5) { return mat('#c7bea9',m.stoneImage,exactRepeat(w,d,tile,1,24),false,true); }
function foundation(s,m) { return box(`${s.id}-single-cheap-stone-foundation`,stone(m,s.width,s.depth),s,0,s.floorY/2,0,s.width,s.floorY,s.depth,true,true); }
function floor(s,m) { return box(`${s.id}-complete-walkable-first-floor`,stone(m,s.width,s.depth),s,0,s.floorY+.06,0,s.width-s.wallT*1.8,.16,s.depth-s.wallT*1.8,true,true); }
function backWall(s,m) { return box(`${s.id}-back-wall-exact`,m.wall,s,0,s.floorY+s.wallH/2,-s.depth/2+s.wallT/2,s.width,s.wallH,s.wallT,false,true); }
function leftWall(s,m) { return box(`${s.id}-left-wall-exact`,m.side,s,-s.width/2+s.wallT/2,s.floorY+s.wallH/2,0,s.wallT,s.wallH,s.depth-s.wallT*2,false,true); }
function rightWall(s,m) { return box(`${s.id}-right-wall-exact`,m.side,s,s.width/2-s.wallT/2,s.floorY+s.wallH/2,0,s.wallT,s.wallH,s.depth-s.wallT*2,false,true); }
function roof(s,m) { const r=roofMesh(s); return manual(`${s.id}-clean-face-uv-gable-roof`,m.roof,s,r,false,true); }
function landing(s,m) { return box(`${s.id}-wide-stone-landing-at-door`,stone(m,s.doorW+4.2,2.45),s,0,s.floorY-.08,s.depth/2+1.25,s.doorW+4.2,.22,2.45,true,true); }
function ramp(s,m) { return box(`${s.id}-one-piece-fast-stair-ramp`,stone(m,s.doorW+4.8,5.8),s,0,.48,s.depth/2+4,s.doorW+4.8,.38,5.8,true,true,{x:-.18}); }
function stairMark(s,m,i) { const w=s.doorW+4.4; return box(`${s.id}-thin-visual-step-marker-${i}`,{...stone(m,w,.18),backfaceCull:false},s,0,.16+i*.28,s.depth/2+1.9+i*1.1,w,.08,.18,false,true,{},false); }
function staticDoor(s,m) { const out=localToWorld(s,0,s.depth/2+s.wallT*.05); return { id:`${s.id}-static-wood-door`, shape:'box', solid:false, walkable:false, noEdge:true, ...m.door, position:{x:out.x,y:s.floorY+s.doorH/2,z:out.z}, size:{x:s.doorW-.18,y:s.doorH-.08,z:.18}, rotation:{y:s.yaw} }; }
function box(id,material,s,lx,y,lz,sx,sy,sz,walkable,noEdge,rot={},solid=true) { const p=localToWorld(s,lx,lz); return { id, shape:'box', solid, walkable, noEdge, ...material, position:{x:p.x,y,z:p.z}, size:{x:sx,y:sy,z:sz}, rotation:{y:s.yaw,...rot} }; }
function manual(id,material,s,data,walkable,noEdge) { return { id, shape:'manual', solid:true, walkable, noEdge, ...material, position:{x:s.x,y:0,z:s.z}, vertices:data.vertices, faces:data.faces, uvs:data.uvs, rotation:{y:s.yaw}, yaw:s.yaw }; }
function roofMesh(s) {
  const hx=s.width/2+s.roofOver, hz=s.depth/2+s.roofOver, y=s.floorY+s.wallH, r=s.roofRise;
  const A=[-hx,y,hz], B=[hx,y,hz], C=[0,y+r,hz], D=[-hx,y,-hz], E=[hx,y,-hz], F=[0,y+r,-hz];
  const verts=[], faces=[], uvs=[]; const add=(pts, uv)=>{ const o=verts.length; verts.push(...pts); uvs.push(...uv); faces.push(pts.map((_,i)=>o+i)); };
  add([A,D,F,C],[0,0,1,0,1,1,0,1]);
  add([B,C,F,E],[0,0,1,0,1,1,0,1]);
  add([D,A,B,E],[0,0,1,0,1,1,0,1]);
  add([A,C,B],[0,0,.5,1,1,0]);
  add([D,E,F],[0,0,1,0,.5,1]);
  return { vertices:verts, faces, uvs };
}
function localToWorld(s,x,z) { const c=Math.cos(s.yaw),q=Math.sin(s.yaw); return { x:s.x+x*c-z*q, z:s.z+x*q+z*c }; }
