// B"H
import { createDoorWallSet } from './DoorWallSystem.js';
import { exactRepeat, materialTexture, roofRepeat, wallRepeat } from '../assets/TextureRepeat.js';

export const DEFAULT_HOUSE_SPEC = Object.freeze({
  id:'Awtsmoos-main-huge-house', x:52, z:-60, yaw:0, floorY:1.32,
  width:78, depth:64, wallH:24, wallT:.95, doorW:2.45, doorH:2.75,
  roofRise:9.6, roofOver:4.5, floors:2, fence:true
});
export const HOUSE_ROOM_KINDS = Object.freeze(['wash-house','far-family-house','side-study-house','small-courtyard-house','tall-learning-house','corner-guest-house']);

/** ModularHouseSystem: measured walls, road-facing doors, aligned stairs, richer collidable fences. */
export function createModularHouse(assets = {}, spec = DEFAULT_HOUSE_SPEC) {
  const s=houseSpec(spec), m=houseMaterials(assets,s), front=frontDoorSet(assets,s).wall;
  const defs=[foundation(s,m), floor(s,m,0), backWall(s,m), leftWall(s,m), rightWall(s,m), front, roof(s,m), ...entryStairs(s,m)];
  if (s.floors > 1) defs.push(secondFloor(s,m), ...insideStairs(s,m));
  if (s.floors > 2) defs.push(thirdFloor(s,m), ...upperStairs(s,m));
  if (s.fence) defs.push(fence(s,m));
  return defs;
}

export function modularHouseDoorDef(assets = {}, spec = DEFAULT_HOUSE_SPEC) {
  return frontDoorSet(assets, houseSpec(spec)).door;
}

export function modularHouseDoorWorld(spec = DEFAULT_HOUSE_SPEC) {
  const s=houseSpec(spec);
  return localToWorld(s,0,s.depth/2-s.wallT/2);
}

export function modularHouseRoadStart(spec = DEFAULT_HOUSE_SPEC) {
  const s=houseSpec(spec), p=localToWorld(s,0,s.depth/2+12.5);
  return { x:p.x, z:p.z };
}

export function modularHouseAnchors(spec = DEFAULT_HOUSE_SPEC) {
  const s=houseSpec(spec);
  return {
    id:s.id,
    frontDoor:modularHouseRoadStart(s),
    frontStairs:localToWorld(s,0,s.depth/2+6.6),
    insideFoyer:localToWorld(s,0,s.depth/2-5.2),
    hallCenter:localToWorld(s,0,0),
    backRoom:localToWorld(s,0,-s.depth/2+7),
    leftRoom:localToWorld(s,-s.width/2+9,0),
    rightRoom:localToWorld(s,s.width/2-9,0),
    upstairsHook:{ ...localToWorld(s,-s.width/2+9,s.depth/2-9), y:s.floorY+s.wallH*.48 }
  };
}

export function createFutureHouseSpecs(base = DEFAULT_HOUSE_SPEC) {
  const b=houseSpec(base);
  return [
    { ...b, id:'Awtsmoos-wash-house', x:-38, z:18, yaw:-.26, floorY:.92, width:48, depth:36, wallH:16.5, roofRise:6.3, roofOver:2.8, floors:2, fence:true },
    { ...b, id:'Awtsmoos-far-family-house', x:-96, z:48, yaw:.32, floorY:1.02, width:56, depth:40, wallH:18.2, roofRise:7.0, roofOver:3.0, floors:3, fence:true },
    { ...b, id:'Awtsmoos-side-study-house', x:98, z:-18, yaw:-.22, floorY:.92, width:50, depth:36, wallH:17.4, roofRise:6.6, roofOver:2.8, floors:2, fence:true },
    { ...b, id:'Awtsmoos-courtyard-house', x:12, z:54, yaw:.18, floorY:.84, width:42, depth:31, wallH:14.3, roofRise:5.5, roofOver:2.4, floors:2, fence:true },
    { ...b, id:'Awtsmoos-tall-learning-house', x:-134, z:-22, yaw:.12, floorY:1.08, width:48, depth:36, wallH:20.5, roofRise:7.5, roofOver:3.0, floors:3, fence:true },
    { ...b, id:'Awtsmoos-corner-guest-house', x:124, z:50, yaw:-.48, floorY:.86, width:40, depth:30, wallH:14.0, roofRise:5.2, roofOver:2.3, floors:2, fence:true }
  ];
}

function frontDoorSet(assets,s) {
  const p=modularHouseDoorWorld(s), m=houseMaterials(assets,s);
  return createDoorWallSet({
    id:`${s.id}-front`, wallId:`${s.id}-front-white-brick-door-wall`, doorId:`${s.id}-front-road-facing-dynamic-door`,
    x:p.x, z:p.z, floorY:s.floorY, yaw:s.yaw, wallW:s.width, wallH:s.wallH, wallT:s.wallT,
    doorW:s.doorW, doorH:s.doorH, doorThickness:.24, panelGap:.08, doorDepth:s.wallT*.72,
    openAngle:Math.PI*.54, noEdge:true, wallColor:'#eee8d9', doorColor:'#9a5827'
  }, { ...m.wall, doorMaterial:m.door });
}

function houseSpec(o) { return { ...DEFAULT_HOUSE_SPEC, ...o }; }

function houseMaterials(assets,s) {
  const brick=assets.whiteBrickImage||assets.brickImage;
  return {
    wall:mat('#eee8d9',brick,wallRepeat(s.width,s.wallH),false,true,false),
    side:mat('#eee8d9',brick,wallRepeat(s.depth,s.wallH),false,true,false),
    stoneImage:assets.stoneImage,
    woodImage:assets.woodImage,
    door:mat('#a56432',assets.woodImage,[2,3],true,true,false),
    roof:mat('#8a5b35',assets.woodImage,roofRepeat(s.width+s.roofOver*2,s.depth+s.roofOver*2),false,false,true),
    fence:mat('#d8c0a0',assets.woodImage,[2,1],false,false,true)
  };
}

function mat(color,image,repeat,anisotropy,backfaceCull,doubleSided) {
  return materialTexture(color,image,repeat,{ anisotropy, backfaceCull, doubleSided, tileWorld:'visual-panel-original-resolution', hook:'modular-house' });
}

function stone(m,w,d,tile=5) { return mat('#c7bea9',m.stoneImage,exactRepeat(w,d,tile,1,28),false,true,false); }
function foundation(s,m) { return box(`${s.id}-raised-stone-foundation`,stone(m,s.width,s.depth),s,0,s.floorY/2,0,s.width,s.floorY,s.depth,true,true); }
function floor(s,m,level) { const y=s.floorY+.06+level*s.wallH*.48; return box(`${s.id}-complete-walkable-floor-${level+1}`,stone(m,s.width,s.depth),s,0,y,0,s.width-s.wallT*1.9,.16,s.depth-s.wallT*1.9,true,true); }
function secondFloor(s,m) { return box(`${s.id}-second-story-walkable-stone-floor`,stone(m,s.width*.64,s.depth*.52),s,-s.width*.10,s.floorY+s.wallH*.48,-s.depth*.06,s.width*.62,.20,s.depth*.50,true,true); }
function thirdFloor(s,m) { return box(`${s.id}-third-story-walkable-stone-balcony`,stone(m,s.width*.48,s.depth*.36),s,s.width*.12,s.floorY+s.wallH*.78,-s.depth*.12,s.width*.46,.20,s.depth*.34,true,true); }
function backWall(s,m) { return box(`${s.id}-back-wall-exact`,m.wall,s,0,s.floorY+s.wallH/2,-s.depth/2+s.wallT/2,s.width,s.wallH,s.wallT,false,true); }
function leftWall(s,m) { return box(`${s.id}-left-wall-exact`,m.side,s,-s.width/2+s.wallT/2,s.floorY+s.wallH/2,0,s.wallT,s.wallH,s.depth-s.wallT*2,false,true); }
function rightWall(s,m) { return box(`${s.id}-right-wall-exact`,m.side,s,s.width/2-s.wallT/2,s.floorY+s.wallH/2,0,s.wallT,s.wallH,s.depth-s.wallT*2,false,true); }
function roof(s,m) { return manual(`${s.id}-outward-hip-roof-clean-uv`,m.roof,s,hipRoofMesh(s),false,true); }

function entryStairs(s,m) {
  const out=[], count=Math.max(4,Math.ceil(s.floorY/.20)+1), w=s.doorW+4.4, stepD=.72, start=s.depth/2+1.2;
  for (let i=0;i<count;i++) {
    const near=count-1-i, d=start+i*stepD, y=.10+near*(s.floorY/count);
    out.push(box(`${s.id}-stone-entry-step-road-to-door-${i+1}`,stone(m,w,stepD,3.2),s,0,y,d,w,.22,stepD,true,true));
  }
  out.push(box(`${s.id}-flush-top-door-landing`,stone(m,w+1.2,2.2,3.2),s,0,s.floorY+.03,s.depth/2+.20,w+1.2,.18,2.2,true,true));
  return out;
}

function insideStairs(s,m) {
  const out=[], steps=12, w=1.75, h=s.wallH*.48/steps;
  for (let i=0;i<steps;i++) out.push(box(`${s.id}-inside-second-story-step-${i+1}`,stone(m,w,1.05,2.5),s,-s.width*.33,s.floorY+.20+i*h,s.depth*.28-i*.88,w,.28,1.05,true,true));
  out.push(box(`${s.id}-inside-second-story-top-landing`,stone(m,w+1.2,2.1,2.5),s,-s.width*.33,s.floorY+s.wallH*.48+.07,s.depth*.28-steps*.88,w+1.2,.18,2.1,true,true));
  return out;
}

function upperStairs(s,m) {
  const out=[], steps=10, w=1.55, h=s.wallH*.30/steps;
  for (let i=0;i<steps;i++) out.push(box(`${s.id}-inside-third-story-step-${i+1}`,stone(m,w,.95,2.5),s,s.width*.18,s.floorY+s.wallH*.48+.22+i*h,-s.depth*.04-i*.72,w,.26,.95,true,true));
  out.push(box(`${s.id}-inside-third-story-top-landing`,stone(m,w+1.0,1.8,2.5),s,s.width*.18,s.floorY+s.wallH*.78+.07,-s.depth*.04-steps*.72,w+1,.18,1.8,true,true));
  return out;
}

function fence(s,m) {
  const pad=7.2, h=1.34, post=.22, railH=.13, yBase=Math.max(.02, s.floorY*.05), w=s.width+pad*2, d=s.depth+pad*2, verts=[],faces=[],uvs=[];
  const railYs=[yBase+h*.30,yBase+h*.55,yBase+h*.80];
  for (const yy of railYs) { boxMesh(verts,faces,uvs,0,yy,d/2,w,railH,.18); boxMesh(verts,faces,uvs,0,yy,-d/2,w,railH,.18); boxMesh(verts,faces,uvs,w/2,yy,.0,.18,railH,d); boxMesh(verts,faces,uvs,-w/2,yy,.0,.18,railH,d); }
  for (let x=-w/2;x<=w/2+.01;x+=2.0) { boxMesh(verts,faces,uvs,x,yBase+h/2,d/2,post,h,post); boxMesh(verts,faces,uvs,x,yBase+h/2,-d/2,post,h,post); }
  for (let z=-d/2;z<=d/2+.01;z+=2.0) { boxMesh(verts,faces,uvs,w/2,yBase+h/2,z,post,h,post); boxMesh(verts,faces,uvs,-w/2,yBase+h/2,z,post,h,post); }
  return manual(`${s.id}-single-merged-three-rail-picket-fence-collidable`,{...m.fence,backfaceCull:false,doubleSided:true},s,{vertices:verts,faces,uvs},false,true);
}

function box(id,material,s,lx,y,lz,sx,sy,sz,walkable,noEdge,rot={},solid=true) {
  const p=localToWorld(s,lx,lz);
  return { id, shape:'box', solid, walkable, noEdge, ...material, position:{x:p.x,y,z:p.z}, size:{x:sx,y:sy,z:sz}, rotation:{y:s.yaw,...rot} };
}

function manual(id,material,s,data,walkable,noEdge) {
  return { id, shape:'manual', solid:true, walkable, noEdge, ...material, position:{x:s.x,y:0,z:s.z}, vertices:data.vertices, faces:data.faces, uvs:data.uvs, rotation:{y:s.yaw}, yaw:s.yaw };
}

function hipRoofMesh(s) {
  const hx=s.width/2+s.roofOver,hz=s.depth/2+s.roofOver,y=s.floorY+s.wallH,r=s.roofRise, top=[0,y+r,0], A=[-hx,y,hz], B=[hx,y,hz], C=[hx,y,-hz], D=[-hx,y,-hz], verts=[],faces=[],uvs=[];
  addFace(verts,faces,uvs,[A,B,top],[0,0,1,0,.5,1]); addFace(verts,faces,uvs,[B,C,top],[0,0,1,0,.5,1]); addFace(verts,faces,uvs,[C,D,top],[0,0,1,0,.5,1]); addFace(verts,faces,uvs,[D,A,top],[0,0,1,0,.5,1]);
  addFace(verts,faces,uvs,[A,D,C,B],[0,0,0,1,1,1,1,0]); return { vertices:verts, faces, uvs };
}

function boxMesh(verts,faces,uvs,x,y,z,sx,sy,sz){ const hx=sx/2,hy=sy/2,hz=sz/2; for(const pts of [[[-hx,-hy,hz],[hx,-hy,hz],[hx,hy,hz],[-hx,hy,hz]],[[hx,-hy,-hz],[-hx,-hy,-hz],[-hx,hy,-hz],[hx,hy,-hz]],[[-hx,-hy,-hz],[-hx,-hy,hz],[-hx,hy,hz],[-hx,hy,-hz]],[[hx,-hy,hz],[hx,-hy,-hz],[hx,hy,-hz],[hx,hy,hz]],[[-hx,hy,hz],[hx,hy,hz],[hx,hy,-hz],[-hx,hy,-hz]],[[-hx,-hy,-hz],[hx,-hy,-hz],[hx,-hy,hz],[-hx,-hy,hz]]]) addFace(verts,faces,uvs,pts.map(p=>[p[0]+x,p[1]+y,p[2]+z]),[0,0,1,0,1,1,0,1]); }
function addFace(verts,faces,uvs,pts,uv){ const o=verts.length; verts.push(...pts); uvs.push(...uv); faces.push(pts.map((_,i)=>o+i)); }
function localToWorld(s,x,z) { const c=Math.cos(s.yaw),q=Math.sin(s.yaw); return { x:s.x+x*c-z*q, z:s.z+x*q+z*c }; }
