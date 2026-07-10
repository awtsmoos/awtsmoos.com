// B"H
import { cubeMesh } from '/libs/awtsmoos-procedural/src/mesh/primitives/box.js';
import { sphereMesh } from '/libs/awtsmoos-procedural/src/mesh/primitives/round.js';
import { v } from '../math/Geometry3D.js';
export const PROCEDURAL_SOURCE = 'Awtsmoos-procedural: manual vertices/faces/uvs + cube/sphere + doorway/cylinder';

/** ManualMesh API: vertices/faces/uvs pass through together; roads no longer get box-projected UVs. */
export function proceduralData(def) {
  const raw = rawMesh(def), vertices = [];
  for (let i = 0; i < raw.positions.length; i += 3) vertices.push(worldPoint(def, raw.positions[i], raw.positions[i + 1], raw.positions[i + 2]));
  return { vertices, indices: raw.indices || [], colors: raw.colors || [], uvs: raw.uvs || null };
}
export function manualMesh({ vertices = [], faces = [], indices = [], uvs = [] }) {
  const positions = vertices.flatMap(point), flatIndices = indices.length ? [...indices] : faces.flatMap(triangulateFace), flatUvs = uvs.length === vertices.length * 2 ? [...uvs] : null;
  return { positions, indices: flatIndices, uvs: flatUvs };
}
function rawMesh(def) {
  if (def.shape === 'manual') return manualMesh(def);
  if (def.shape === 'doorway') return booleanDoorwayMesh(def);
  if (def.shape === 'cylinder') return cleanCylinderMesh(def);
  if (def.shape === 'triPrism') return triPrismMesh(def);
  if (def.shape === 'sphere') return sphereMesh({ radius: def.radius || 1, rings: 10, segments: 20, color: def.rgba });
  return cubeMesh({ size: [1, 1, 1], color: def.rgba || [0.7, 0.7, 0.7, 1] });
}
function point(p) { return Array.isArray(p) ? [p[0], p[1], p[2]] : [p.x || 0, p.y || 0, p.z || 0]; }
function triangulateFace(face) { const out = []; for (let i = 1; i < face.length - 1; i++) out.push(face[0], face[i], face[i + 1]); return out; }
function triPrismMesh(def) { const s = def.size || { x:2, y:1, z:.4 }, hx=s.x/2, hy=s.y/2, hz=s.z/2; return manualMesh({ vertices:[[-hx,-hy,hz],[hx,-hy,hz],[0,hy,hz],[-hx,-hy,-hz],[hx,-hy,-hz],[0,hy,-hz]], faces:[[0,1,2],[4,3,5],[0,3,4,1],[1,4,5,2],[2,5,3,0]] }); }
function booleanDoorwayMesh(def) { const s=def.size||{x:7,y:3,z:.7}, d=def.door||{x:2.2,y:2.15}, hx=s.x/2, hy=s.y/2, hz=s.z/2, dx=d.x/2, yt=-hy+d.y, m=mesh(); for (const z of [hz,-hz]) { const back=z<0; faceZ(m,-hx,-hy,-dx,hy,z,back); faceZ(m,dx,-hy,hx,hy,z,back); faceZ(m,-dx,yt,dx,hy,z,back); } faceX(m,-hx,-hy,hy,-hz,hz,false); faceX(m,hx,-hy,hy,-hz,hz,true); faceY(m,-hx,hx,hy,-hz,hz,true); faceY(m,-hx,-dx,-hy,-hz,hz,false); faceY(m,dx,hx,-hy,-hz,hz,false); faceX(m,-dx,-hy,yt,-hz,hz,true); faceX(m,dx,-hy,yt,-hz,hz,false); faceY(m,-dx,dx,yt,-hz,hz,false); return m; }
function cleanCylinderMesh(def) { const radius=def.radius||1, height=def.height||1, n=Math.max(12,def.segments||32), m=mesh(), topC=addV(m,0,height/2,0), botC=addV(m,0,-height/2,0), top=[], bot=[]; for (let s=0;s<n;s++) { const a=s/n*Math.PI*2; top.push(addV(m,Math.cos(a)*radius,height/2,Math.sin(a)*radius)); bot.push(addV(m,Math.cos(a)*radius,-height/2,Math.sin(a)*radius)); } for (let s=0;s<n;s++) { const t=top[s],b=bot[s],nt=top[(s+1)%n],nb=bot[(s+1)%n]; tri(m,topC,nt,t); tri(m,botC,b,nb); tri(m,t,nb,b); tri(m,t,nt,nb); } return m; }
function mesh() { return { positions: [], indices: [] }; }
function addV(m,x,y,z) { m.positions.push(x,y,z); return m.positions.length/3-1; }
function tri(m,a,b,c) { m.indices.push(a,b,c); }
function quadI(m,a,b,c,d) { tri(m,a,b,c); tri(m,a,c,d); }
function quad(m,pts) { const i=pts.map(p=>addV(m,p[0],p[1],p[2])); quadI(m,i[0],i[1],i[2],i[3]); }
function faceZ(m,x0,y0,x1,y1,z,back) { quad(m, back ? [[x1,y0,z],[x0,y0,z],[x0,y1,z],[x1,y1,z]] : [[x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z]]); }
function faceX(m,x,y0,y1,z0,z1,right) { quad(m, right ? [[x,y0,z1],[x,y0,z0],[x,y1,z0],[x,y1,z1]] : [[x,y0,z0],[x,y0,z1],[x,y1,z1],[x,y1,z0]]); }
function faceY(m,x0,x1,y,z0,z1,top) { quad(m, top ? [[x0,y,z1],[x1,y,z1],[x1,y,z0],[x0,y,z0]] : [[x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1]]); }
function worldPoint(def,x,y,z) { const p=rotate(v(x,y,z), def.rotation || { x:def.pitch||0, y:def.yaw||0, z:def.roll||0 }), c=def.position||{x:0,y:0,z:0}; return v(p.x+c.x,p.y+c.y,p.z+c.z); }
function rotate(p,r) { let {x,y,z}=p; const cx=Math.cos(r.x||0),sx=Math.sin(r.x||0),cy=Math.cos(r.y||0),sy=Math.sin(r.y||0),cz=Math.cos(r.z||0),sz=Math.sin(r.z||0); [y,z]=[y*cx-z*sx,y*sx+z*cx]; [x,z]=[x*cy-z*sy,x*sy+z*cy]; [x,y]=[x*cz-y*sz,x*sz+y*cz]; return v(x,y,z); }
