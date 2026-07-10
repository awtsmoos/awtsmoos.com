// B"H
import { createDoorWallSet } from './DoorWallSystem.js';
import { exactRepeat, materialTexture, roofRepeat, wallRepeat } from '../assets/TextureRepeat.js';
export const DEFAULT_HOUSE_SPEC = Object.freeze({ id:'Awtsmoos-main-huge-house', x:48, z:-58, yaw:0, floorY:1.18, width:58, depth:47, wallH:19.5, wallT:.9, doorW:2.45, doorH:2.75, roofRise:7.6, roofOver:3.6, floors:2, fence:true });
export const HOUSE_ROOM_KINDS = Object.freeze(['wash-house','far-family-house','side-study-house','small-courtyard-house','tall-learning-house','corner-guest-house']);

/** ModularHouseSystem: every house owns a true doorway wall, dynamic door def, stairs, and a merged picket fence. */
export function createModularHouse(assets = {}, spec = DEFAULT_HOUSE_SPEC) {
  const s=houseSpec(spec), m=houseMaterials(assets,s), front=frontDoorSet(assets,s).wall;
  const defs=[foundation(s,m), floor(s,m,0), backWall(s,m), leftWall(s,m), rightWall(s,m), front, roof(s,m), ...entryStairs(s,m)];
  if (s.floors > 1) defs.push(secondFloor(s,m), ...insideStairs(s,m));
  if (s.fence) defs.push(fence(s,m));
  return defs;
}
export function modularHouseDoorDef(assets = {}, spec = DEFAULT_HOUSE_SPEC) { return frontDoorSet(assets, houseSpec(spec)).door; }
export function modularHouseDoorWorld(spec = DEFAULT_HOUSE_SPEC) { const s=houseSpec(spec); return localToWorld(s,0,s.depth/2-s.wallT/2); }
export function modularHouseRoadStart(spec = DEFAULT_HOUSE_SPEC) { const s=houseSpec(spec), p=localToWorld(s,0,s.depth/2+9.8); return { x:p.x, z:p.z }; }
export function modularHouseAnchors(spec = DEFAULT_HOUSE_SPEC) { const s=houseSpec(spec); return { id:s.id, frontDoor:modularHouseRoadStart(s), frontStairs:localToWorld(s,0,s.depth/2+5.2), insideFoyer:localToWorld(s,0,s.depth/2-4.5), hallCenter:localToWorld(s,0,0), backRoom:localToWorld(s,0,-s.depth/2+6), leftRoom:localToWorld(s,-s.width/2+7,0), rightRoom:localToWorld(s,s.width/2-7,0), upstairsHook:{ ...localToWorld(s,-s.width/2+8,s.depth/2-8), y:s.floorY+s.wallH*.48 } }; }
export function createFutureHouseSpecs(base = DEFAULT_HOUSE_SPEC) { const b=houseSpec(base); return [
  { ...b, id:'Awtsmoos-wash-house', x:-30, z:16, yaw:-.26, floorY:.82, width:34, depth:25, wallH:12.5, roofRise:4.7, roofOver:2.0, floors:2, fence:true },
  { ...b, id:'Awtsmoos-far-family-house', x:-78, z:42, yaw:.32, floorY:.86, width:39, depth:28, wallH:13.8, roofRise:5.3, roofOver:2.2, floors:2, fence:true },
  { ...b, id:'Awtsmoos-side-study-house', x:82, z:-14, yaw:-.22, floorY:.78, width:35, depth:25, wallH:12.8, roofRise:4.8, roofOver:2.0, floors:2, fence:true },
  { ...b, id:'Awtsmoos-courtyard-house', x:12, z:42, yaw:.18, floorY:.72, width:28, depth:21, wallH:10.8, roofRise:4.0, roofOver:1.7, floors:1, fence:true },
  { ...b, id:'Awtsmoos-tall-learning-house', x:-116, z:-18, yaw:.12, floorY:.92, width:32, depth:24, wallH:15.2, roofRise:5.4, roofOver:2.0, floors:2, fence:true },
  { ...b, id:'Awtsmoos-corner-guest-house', x:104, z:43, yaw:-.48, floorY:.75, width:27, depth:20, wallH:10.5, roofRise:3.8, roofOver:1.6, floors:1, fence:true }
]; }
function frontDoorSet(assets,s) { const p=modularHouseDoorWorld(s), m=houseMaterials(assets,s); return createDoorWallSet({ id:`${s.id}-front`, wallId:`${s.id}-front-white-brick-door-wall`, doorId:`${s.id}-front-road-facing-dynamic-door`, x:p.x, z:p.z, floorY:s.floorY, yaw:s.yaw, wallW:s.width, wallH:s.wallH, wallT:s.wallT, doorW:s.doorW, doorH:s.doorH, doorThickness:.24, panelGap:.08, doorDepth:s.wallT/2+.16, openAngle:Math.PI*.54, noEdge:true, wallColor:'#eee8d9', doorColor:'#9a5827' }, { ...m.wall, doorMaterial:m.door }); }
function houseSpec(o) { return { ...DEFAULT_HOUSE_SPEC, ...o }; }
function houseMaterials(assets,s) { const brick=assets.whiteBrickImage||assets.brickImage; return { wall:mat('#eee8d9',brick,wallRepeat(s.width,s.wallH),false,true,false), side:mat('#eee8d9',brick,wallRepeat(s.depth,s.wallH),false,true,false), stoneImage:assets.stoneImage, woodImage:assets.woodImage, door:mat('#a56432',assets.woodImage,[2,3],true,true,false), roof:mat('#8a5b35',assets.woodImage,roofRepeat(s.width+s.roofOver*2,s.depth+s.roofOver*2),false,false,true), fence:mat('#fff4cf',assets.woodImage,[1,1],false,false,false) }; }
function mat(color,image,repeat,anisotropy,backfaceCull,doubleSided) { return materialTexture(color,image,repeat,{ anisotropy, backfaceCull, doubleSided, tileWorld:'visual-panel-original-resolution', hook:'modular-house' }); }
function stone(m,w,d,tile=5) { return mat('#c7bea9',m.stoneImage,exactRepeat(w,d,tile,1,24),false,true,false); }
function foundation(s,m) { return box(`${s.id}-raised-stone-foundation`,stone(m,s.width,s.depth),s,0,s.floorY/2,0,s.width,s.floorY,s.depth,true,true); }
function floor(s,m,level) { const y=s.floorY+.06+level*s.wallH*.48; return box(`${s.id}-complete-walkable-floor-${level+1}`,stone(m,s.width,s.depth),s,0,y,0,s.width-s.wallT*1.9,.16,s.depth-s.wallT*1.9,true,true); }
function secondFloor(s,m) { return box(`${s.id}-second-story-walkable-stone-floor`,stone(m,s.width*.58,s.depth*.44),s,-s.width*.12,s.floorY+s.wallH*.48, -s.depth*.06, s.width*.56,.18,s.depth*.42,true,true); }
function backWall(s,m) { return box(`${s.id}-back-wall-exact`,m.wall,s,0,s.floorY+s.wallH/2,-s.depth/2+s.wallT/2,s.width,s.wallH,s.wallT,false,true); }
function leftWall(s,m) { return box(`${s.id}-left-wall-exact`,m.side,s,-s.width/2+s.wallT/2,s.floorY+s.wallH/2,0,s.wallT,s.wallH,s.depth-s.wallT*2,false,true); }
function rightWall(s,m) { return box(`${s.id}-right-wall-exact`,m.side,s,s.width/2-s.wallT/2,s.floorY+s.wallH/2,0,s.wallT,s.wallH,s.depth-s.wallT*2,false,true); }
function roof(s,m) { return manual(`${s.id}-outward-hip-roof-clean-uv`,m.roof,s,hipRoofMesh(s),false,true); }
function entryStairs(s,m) { const out=[], count=Math.max(3,Math.ceil(s.floorY/.23)+1), w=s.doorW+3.2; for (let i=0;i<count;i++) { const d=s.depth/2+1.25+i*.62, y=.1+i*(s.floorY/count), sz=.64; out.push(box(`${s.id}-stone-entry-step-${i+1}`,stone(m,w,sz,3.2),s,0,y,d,w,.22,sz,true,true)); } return out; }
function insideStairs(s,m) { const out=[], steps=10, w=1.5; for (let i=0;i<steps;i++) out.push(box(`${s.id}-inside-second-story-step-${i+1}`,stone(m,w,1.0,2.5),s,-s.width*.32,s.floorY+.22+i*.35,s.depth*.25-i*.82,w,.28,1.0,true,true)); return out; }
function fence(s,m) { const pad=4.8,h=.95,post=.16, y=s.floorY*.1+h/2, w=s.width+pad*2,d=s.depth+pad*2, verts=[],faces=[],uvs=[]; const rail=(id,x,z,sx,sz)=>boxMesh(verts,faces,uvs,x,y,z,sx,.12,sz); rail('f1',0,d/2,w,.12); rail('f2',0,-d/2,w,.12); rail('f3',w/2,0,.12,d); rail('f4',-w/2,0,.12,d); for (let x=-w/2;x<=w/2+.01;x+=2.2){boxMesh(verts,faces,uvs,x,h/2,d/2,post,h,post);boxMesh(verts,faces,uvs,x,h/2,-d/2,post,h,post);} for(let z=-d/2;z<=d/2+.01;z+=2.2){boxMesh(verts,faces,uvs,w/2,h/2,z,post,h,post);boxMesh(verts,faces,uvs,-w/2,h/2,z,post,h,post);} return manual(`${s.id}-single-merged-picket-fence`,{...m.fence,backfaceCull:false,doubleSided:true},s,{vertices:verts,faces,uvs},false,true); }
function box(id,material,s,lx,y,lz,sx,sy,sz,walkable,noEdge,rot={},solid=true) { const p=localToWorld(s,lx,lz); return { id, shape:'box', solid, walkable, noEdge, ...material, position:{x:p.x,y,z:p.z}, size:{x:sx,y:sy,z:sz}, rotation:{y:s.yaw,...rot} }; }
function manual(id,material,s,data,walkable,noEdge) { return { id, shape:'manual', solid:true, walkable, noEdge, ...material, position:{x:s.x,y:0,z:s.z}, vertices:data.vertices, faces:data.faces, uvs:data.uvs, rotation:{y:s.yaw}, yaw:s.yaw }; }
function hipRoofMesh(s) { const hx=s.width/2+s.roofOver,hz=s.depth/2+s.roofOver,y=s.floorY+s.wallH,r=s.roofRise, top=[0,y+r,0], A=[-hx,y,hz], B=[hx,y,hz], C=[hx,y,-hz], D=[-hx,y,-hz], verts=[],faces=[],uvs=[]; addFace(verts,faces,uvs,[A,top,B],[0,0,.5,1,1,0]); addFace(verts,faces,uvs,[B,top,C],[0,0,.5,1,1,0]); addFace(verts,faces,uvs,[C,top,D],[0,0,.5,1,1,0]); addFace(verts,faces,uvs,[D,top,A],[0,0,.5,1,1,0]); addFace(verts,faces,uvs,[D,C,B,A],[0,0,1,0,1,1,0,1]); return { vertices:verts, faces, uvs }; }
function boxMesh(verts,faces,uvs,x,y,z,sx,sy,sz){ const hx=sx/2,hy=sy/2,hz=sz/2; for(const pts of [[[-hx,-hy,hz],[hx,-hy,hz],[hx,hy,hz],[-hx,hy,hz]],[[hx,-hy,-hz],[-hx,-hy,-hz],[-hx,hy,-hz],[hx,hy,-hz]],[[-hx,-hy,-hz],[-hx,-hy,hz],[-hx,hy,hz],[-hx,hy,-hz]],[[hx,-hy,hz],[hx,-hy,-hz],[hx,hy,-hz],[hx,hy,hz]],[[-hx,hy,hz],[hx,hy,hz],[hx,hy,-hz],[-hx,hy,-hz]],[[-hx,-hy,-hz],[hx,-hy,-hz],[hx,-hy,hz],[-hx,-hy,hz]]]) addFace(verts,faces,uvs,pts.map(p=>[p[0]+x,p[1]+y,p[2]+z]),[0,0,1,0,1,1,0,1]); }
function addFace(verts,faces,uvs,pts,uv){ const o=verts.length; verts.push(...pts); uvs.push(...uv); faces.push(pts.map((_,i)=>o+i)); }
function localToWorld(s,x,z) { const c=Math.cos(s.yaw),q=Math.sin(s.yaw); return { x:s.x+x*c-z*q, z:s.z+x*q+z*c }; }
