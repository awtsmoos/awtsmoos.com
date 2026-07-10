// B"H
import { createDoorWallSet } from './DoorWallSystem.js';
import { exactRepeat, materialTexture, roofRepeat, wallRepeat } from '../assets/TextureRepeat.js';
export const DEFAULT_HOUSE_SPEC = Object.freeze({ id:'Awtsmoos-main-huge-house', x:48, z:-58, yaw:0, floorY:1.05, width:53.4, depth:43.2, wallH:17.7, wallT:.82, doorW:2.45, doorH:2.75, roofRise:8.2, roofOver:3.2 });

/** ModularHouseSystem: huge house, huge readable texture panels, one draw per mesh. */
export function createModularHouse(assets = {}, spec = DEFAULT_HOUSE_SPEC) {
  const s = houseSpec(spec), mats = houseMaterials(assets, s), front = frontDoorSet(assets, s).wall;
  return [foundation(s,mats), floor(s,mats), backWall(s,mats), leftWall(s,mats), rightWall(s,mats), front, roof(s,mats), landing(s,mats), ramp(s,mats), stairMark(s,mats,1), stairMark(s,mats,2)];
}
export function modularHouseDoorDef(assets = {}, spec = DEFAULT_HOUSE_SPEC) { return frontDoorSet(assets, houseSpec(spec)).door; }
export function modularHouseRoadStart(spec = DEFAULT_HOUSE_SPEC) { const s = houseSpec(spec), p = localToWorld(s, 0, s.depth/2 + 9.6); return { x:p.x, z:p.z }; }
export function modularHouseDoorWorld(spec = DEFAULT_HOUSE_SPEC) { const s = houseSpec(spec); return localToWorld(s, 0, s.depth/2 - s.wallT/2); }
function frontDoorSet(assets, s) { const p = modularHouseDoorWorld(s), mats = houseMaterials(assets, s); return createDoorWallSet({ id:`${s.id}-front`, wallId:`${s.id}-front-white-brick-door-wall`, doorId:`${s.id}-front-outside-flush-door`, x:p.x, z:p.z, floorY:s.floorY, yaw:s.yaw, wallW:s.width, wallH:s.wallH, wallT:s.wallT, doorW:s.doorW, doorH:s.doorH, doorThickness:.24, panelGap:.08, doorDepth:s.wallT/2+.18, openAngle:Math.PI*.54, noEdge:true, wallColor:'#eee8d9', doorColor:'#9a5827' }, { ...mats.wall, doorMaterial:mats.door }); }
function houseSpec(o) { return { ...DEFAULT_HOUSE_SPEC, ...o }; }
function houseMaterials(assets, s) { const brick = assets.whiteBrickImage || assets.brickImage; return { wall: mat('#eee8d9', brick, wallRepeat(s.width,s.wallH), false, true), side: mat('#eee8d9', brick, wallRepeat(s.depth,s.wallH), false, true), stoneImage: assets.stoneImage, woodImage: assets.woodImage, door: mat('#a56432', assets.woodImage, [3,4], true, true), roof: mat('#b88a5d', assets.woodImage, roofRepeat(s.width+s.roofOver*2, s.depth+s.roofOver*2), false, true) }; }
function mat(color, image, repeat, anisotropy, backfaceCull) { return materialTexture(color, image, repeat, { anisotropy, backfaceCull, tileWorld:'visual-panel-original-resolution' }); }
function stone(m, w, d, tile = 5.0) { return mat('#c7bea9', m.stoneImage, exactRepeat(w, d, tile, 1, 24), false, true); }
function foundation(s,m) { return box(`${s.id}-single-cheap-stone-foundation`, stone(m,s.width,s.depth), s, 0, s.floorY/2, 0, s.width, s.floorY, s.depth, true, true); }
function floor(s,m) { return box(`${s.id}-complete-walkable-first-floor`, stone(m,s.width,s.depth), s, 0, s.floorY+.06, 0, s.width-s.wallT*1.8, .16, s.depth-s.wallT*1.8, true, true); }
function backWall(s,m) { return box(`${s.id}-back-wall-exact`, m.wall, s, 0, s.floorY+s.wallH/2, -s.depth/2+s.wallT/2, s.width, s.wallH, s.wallT, false, true); }
function leftWall(s,m) { return box(`${s.id}-left-wall-exact`, m.side, s, -s.width/2+s.wallT/2, s.floorY+s.wallH/2, 0, s.wallT, s.wallH, s.depth-s.wallT*2, false, true); }
function rightWall(s,m) { return box(`${s.id}-right-wall-exact`, m.side, s, s.width/2-s.wallT/2, s.floorY+s.wallH/2, 0, s.wallT, s.wallH, s.depth-s.wallT*2, false, true); }
function roof(s,m) { return manual(`${s.id}-huge-bright-gable-roof`, m.roof, s, roofMesh(s), false, true); }
function landing(s,m) { return box(`${s.id}-wide-stone-landing-at-door`, stone(m, s.doorW+4.2, 2.45), s, 0, s.floorY-.08, s.depth/2+1.25, s.doorW+4.2, .22, 2.45, true, true); }
function ramp(s,m) { return box(`${s.id}-one-piece-fast-stair-ramp`, stone(m, s.doorW+4.8, 5.8), s, 0, .48, s.depth/2+4.0, s.doorW+4.8, .38, 5.8, true, true, { x:-.18 }); }
function stairMark(s,m,i) { const w=s.doorW+4.4; return box(`${s.id}-thin-visual-step-marker-${i}`, { ...stone(m,w,.18), backfaceCull:false }, s, 0, .16+i*.28, s.depth/2+1.9+i*1.1, w, .08, .18, false, true, {}, false); }
function box(id, material, s, lx, y, lz, sx, sy, sz, walkable, noEdge, rot = {}, solid = true) { const p = localToWorld(s,lx,lz); return { id, shape:'box', solid, walkable, noEdge, ...material, position:{ x:p.x, y, z:p.z }, size:{ x:sx, y:sy, z:sz }, rotation:{ y:s.yaw, ...rot } }; }
function manual(id, material, s, data, walkable, noEdge) { return { id, shape:'manual', solid:true, walkable, noEdge, ...material, position:{ x:s.x, y:0, z:s.z }, vertices:data.vertices, faces:data.faces, rotation:{ y:s.yaw }, yaw:s.yaw }; }
function roofMesh(s) { const hx=s.width/2+s.roofOver, hz=s.depth/2+s.roofOver, y=s.floorY+s.wallH, r=s.roofRise; return { vertices:[[-hx,y,hz],[hx,y,hz],[0,y+r,hz],[-hx,y,-hz],[hx,y,-hz],[0,y+r,-hz],[-hx+.8,y-.22,hz-.7],[hx-.8,y-.22,hz-.7],[-hx+.8,y-.22,-hz+.7],[hx-.8,y-.22,-hz+.7]], faces:[[0,3,5,2],[1,2,5,4],[0,1,4,3],[0,2,1],[3,4,5],[6,8,9,7]] }; }
function localToWorld(s,x,z) { const c=Math.cos(s.yaw), q=Math.sin(s.yaw); return { x:s.x+x*c-z*q, z:s.z+x*q+z*c }; }
