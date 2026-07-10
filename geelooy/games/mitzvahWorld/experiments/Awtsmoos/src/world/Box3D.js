// B"H
import { BufferAttribute, BufferGeometry, Mesh, MeshStandardMaterial } from '../../../light-three-gltf/tiny-runtime.js';
import { triangleNormal, v } from '../math/Geometry3D.js';
import { trianglesFromIndexed } from '../collision/TriangleCollider.js';
import { proceduralData } from './ProceduralBridge.js';
const PROCEDURAL = ['manual', 'doorway', 'cylinder', 'sphere', 'triPrism'];

/** Primitive meshes: original textures are tiled by real object bounds, not guessed world scars. */
export function createPrimitiveMesh(def) {
  const data = primitiveData(def), g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(flat(data.vertices)), 3));
  g.setAttribute('normal', new BufferAttribute(new Float32Array(vertexNormals(data)), 3));
  g.setAttribute('uv', new BufferAttribute(new Float32Array(uvsByBounds(data.vertices)), 2));
  g.setIndex(new BufferAttribute(new Uint16Array(data.indices), 1));
  const mat = new MeshStandardMaterial({ name: def.id, color: colorArray(def.color), doubleSided: !!def.doubleSided });
  Object.assign(mat, { mapImage: def.mapImage || null, textureUrl: def.textureUrl || def.mapImage?.dataset?.url || def.mapImage?.src || null, mapRepeat: def.mapRepeat || [1, 1], anisotropy: def.anisotropy ?? true, backfaceCull: !!def.backfaceCull, texturePolicy: def.texturePolicy || null });
  const mesh = new Mesh(g, mat); mesh.name = def.id; mesh.userData.procedural = PROCEDURAL.includes(def.shape); mesh.setBaseTransform(); return mesh;
}
export function primitiveColliders(def) { const data = primitiveData(def), floor = def.walkable === true ? undefined : false; return trianglesFromIndexed(data.vertices, data.indices, { kind: def.id, solid: def.solid !== false, floor }); }
function primitiveData(def) { return PROCEDURAL.includes(def.shape) ? proceduralData({ ...def, rgba: colorArray(def.color) }) : def.shape === 'diamond' ? diamondData(def) : boxData(def); }
function boxData(def) { const s = def.size, hx = s.x/2, hy = s.y/2, hz = s.z/2, m = { vertices: [], indices: [] }; face(m,[[-hx,-hy,hz],[hx,-hy,hz],[hx,hy,hz],[-hx,hy,hz]]); face(m,[[hx,-hy,-hz],[-hx,-hy,-hz],[-hx,hy,-hz],[hx,hy,-hz]]); face(m,[[-hx,-hy,-hz],[-hx,-hy,hz],[-hx,hy,hz],[-hx,hy,-hz]]); face(m,[[hx,-hy,hz],[hx,-hy,-hz],[hx,hy,-hz],[hx,hy,hz]]); face(m,[[-hx,hy,hz],[hx,hy,hz],[hx,hy,-hz],[-hx,hy,-hz]]); face(m,[[-hx,-hy,-hz],[hx,-hy,-hz],[hx,-hy,hz],[-hx,-hy,hz]]); return { vertices: m.vertices.map(p => localToWorld(v(...p), def)), indices: m.indices }; }
function diamondData(def) { const s=def.size,hx=s.x/2,hy=s.y/2,hz=s.z/2,l=[v(0,hy,0),v(hx,0,0),v(0,0,hz),v(-hx,0,0),v(0,0,-hz),v(0,-hy,0)], indices=[0,2,1,0,3,2,0,4,3,0,1,4,5,1,2,5,2,3,5,3,4,5,4,1]; return { vertices:l.map(p=>localToWorld(p,def)), indices }; }
function face(m, pts) { const i = pts.map(p => { m.vertices.push(p); return m.vertices.length - 1; }); m.indices.push(i[0], i[1], i[2], i[0], i[2], i[3]); }
function localToWorld(p, def) { const q = rotate(p, def.rotation || { x: def.pitch || 0, y: def.yaw || 0, z: def.roll || 0 }), c = def.position; return v(q.x + c.x, q.y + c.y, q.z + c.z); }
function rotate(p, r) { let { x,y,z } = p; const cx=Math.cos(r.x||0), sx=Math.sin(r.x||0), cy=Math.cos(r.y||0), sy=Math.sin(r.y||0), cz=Math.cos(r.z||0), sz=Math.sin(r.z||0); [y,z]=[y*cx-z*sx,y*sx+z*cx]; [x,z]=[x*cy-z*sy,x*sy+z*cy]; [x,y]=[x*cz-y*sz,x*sz+y*cz]; return v(x,y,z); }
function flat(vertices) { return vertices.flatMap(p => [p.x, p.y, p.z]); }
function colorArray(hex = '#777777') { const n = parseInt(String(hex).replace('#',''),16); return [((n>>16)&255)/255, ((n>>8)&255)/255, (n&255)/255, 1]; }
function uvsByBounds(vertices) { const b = bounds(vertices), rx=b.max.x-b.min.x, ry=b.max.y-b.min.y, rz=b.max.z-b.min.z, useFloor = ry <= Math.min(rx, rz) * .08, useX = rx >= rz; return vertices.flatMap(p => useFloor ? safeUv(p.x,b.min.x,rx,p.z,b.min.z,rz) : useX ? safeUv(p.x,b.min.x,rx,p.y,b.min.y,ry) : safeUv(p.z,b.min.z,rz,p.y,b.min.y,ry)); }
function safeUv(a, amin, ar, b, bmin, br) { return [(a - amin) / (ar || 1), (b - bmin) / (br || 1)]; }
function bounds(vertices) { const min=v(Infinity,Infinity,Infinity), max=v(-Infinity,-Infinity,-Infinity); for (const p of vertices) { min.x=Math.min(min.x,p.x); min.y=Math.min(min.y,p.y); min.z=Math.min(min.z,p.z); max.x=Math.max(max.x,p.x); max.y=Math.max(max.y,p.y); max.z=Math.max(max.z,p.z); } return { min, max }; }
function vertexNormals(data) { const out = new Array(data.vertices.length).fill(0).map(()=>v()); for (let i=0;i<data.indices.length;i+=3) { const a=data.indices[i],b=data.indices[i+1],c=data.indices[i+2],n=triangleNormal(data.vertices[a],data.vertices[b],data.vertices[c]); for (const k of [a,b,c]) { out[k].x+=n.x; out[k].y+=n.y; out[k].z+=n.z; } } return out.flatMap(n=>{ const l=Math.hypot(n.x,n.y,n.z)||1; return [n.x/l,n.y/l,n.z/l]; }); }
