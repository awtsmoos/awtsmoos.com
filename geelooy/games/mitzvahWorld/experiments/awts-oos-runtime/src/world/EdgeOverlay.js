// B"H
import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh } from './Box3D.js';

/** EdgeOverlay: dark hairline vessels so shapes stop hiding their borders. */
export function createEdgeOverlay(def) {
  const group = new Group(); group.name = `${def.id}-awts-edges`;
  for (const edge of edgeDefs(def)) group.add(createPrimitiveMesh(edge));
  return group;
}

function edgeDefs(def) {
  if (def.shape === 'sphere') return [];
  if (def.shape === 'cylinder') return cylinderEdges(def);
  const out = boxEdges(def);
  if (def.shape === 'doorway') out.push(...doorEdges(def));
  return out;
}

function boxEdges(def) {
  const s = def.size || { x: 1, y: 1, z: 1 }, t = 0.045, out = [];
  const x = s.x / 2, y = s.y / 2, z = s.z / 2;
  for (const zz of [-z, z]) out.push(bar(def, `top-x-${zz}`, [0, y + t, zz], [s.x + t, t, t]));
  for (const xx of [-x, x]) out.push(bar(def, `top-z-${xx}`, [xx, y + t, 0], [t, t, s.z + t]));
  for (const xx of [-x, x]) for (const zz of [-z, z]) out.push(bar(def, `v-${xx}-${zz}`, [xx, 0, zz], [t, s.y + t, t]));
  return out;
}

function doorEdges(def) {
  const s = def.size, d = def.door || { x: 2.2, y: 2.15 }, t = 0.055, y0 = -s.y / 2 + d.y / 2, yt = -s.y / 2 + d.y;
  return [bar(def, 'door-left', [-d.x / 2, y0, s.z / 2 + t], [t, d.y, t]), bar(def, 'door-right', [d.x / 2, y0, s.z / 2 + t], [t, d.y, t]), bar(def, 'door-top', [0, yt, s.z / 2 + t], [d.x + t, t, t])];
}

function cylinderEdges(def) {
  const out = [], n = 12, t = 0.045, r = (def.radius || 1) + t, h = def.height || 1;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; out.push(bar(def, `rib-${i}`, [Math.cos(a) * r, 0, Math.sin(a) * r], [t, h + t, t])); }
  return out;
}

function bar(def, suffix, local, size) {
  return { id: `${def.id}-edge-${suffix}`, shape: 'box', solid: false, color: '#120d09', position: add(def.position, rotate(local, def.rotation || { y: def.yaw || 0 })), size: { x: size[0], y: size[1], z: size[2] }, rotation: def.rotation || { y: def.yaw || 0 } };
}
function add(a, b) { return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }; }
function rotate(p, r) { let [x,y,z] = p; const cx=Math.cos(r.x||0),sx=Math.sin(r.x||0),cy=Math.cos(r.y||0),sy=Math.sin(r.y||0),cz=Math.cos(r.z||0),sz=Math.sin(r.z||0); [y,z]=[y*cx-z*sx,y*sx+z*cx]; [x,z]=[x*cy-z*sy,x*sy+z*cy]; [x,y]=[x*cz-y*sz,x*sz+y*cz]; return { x, y, z }; }
