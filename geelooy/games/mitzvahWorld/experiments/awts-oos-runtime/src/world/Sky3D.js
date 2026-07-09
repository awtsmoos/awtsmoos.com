// B"H
import { BufferAttribute, BufferGeometry, Mesh, MeshStandardMaterial, Group } from '../../../light-three-gltf/tiny-runtime.js';
import { normalize, v } from '../math/Geometry3D.js';

/** Sky3D: layered atmosphere, warm sun bloom, horizon haze, and drifting cloud veils. */
export function createSky3D() {
  const group = new Group(); group.name = 'AWTS_physicalish_sky_sun_clouds_flares';
  group.add(skyDome()); group.add(hazeRing()); group.add(sunDisk('sun-atmosphere', [-44,34,-60], 21, [1,.64,.28,.18]));
  group.add(sunDisk('sun-corona', [-43,33,-59], 10, [1,.82,.36,.38])); group.add(sunDisk('sun-core', [-42,32,-58], 3.9, [1,.96,.58,1]));
  group.add(sunDisk('flare-gold-1', [-30,20,-40], 7.5, [1,.72,.24,.15])); group.add(sunDisk('flare-cyan-2', [-18,13,-27], 4.4, [.35,.85,1,.11]));
  group.add(sunDisk('flare-rose-3', [-7,8,-14], 2.7, [1,.36,.28,.09])); group.add(sunDisk('flare-ghost-4', [10,6,9], 5.8, [.7,1,.86,.07]));
  for (let i = 0; i < 8; i++) group.add(cloud(`cloud-wisp-${i}`, -36 + i * 11, 15 + (i % 3) * 2, -42 + (i % 4) * 9, 8 + (i % 2) * 3));
  return group;
}

function skyDome(radius = 118, rings = 22, segments = 64) {
  const positions = [], normals = [], colors = [], indices = [];
  for (let r = 0; r <= rings; r++) for (let s = 0; s <= segments; s++) { const t = r / rings, a = s / segments * Math.PI * 2, phi = t * Math.PI * .55; const y = Math.sin(phi) * radius - 28, ring = Math.cos(phi) * radius; positions.push(Math.cos(a)*ring, y, Math.sin(a)*ring); normals.push(0,1,0); colors.push(...skyColor(t,a)); }
  for (let r = 0; r < rings; r++) for (let s = 0; s < segments; s++) { const a = r * (segments + 1) + s, b = a + 1, c = a + segments + 1, d = c + 1; indices.push(a,c,b,b,c,d); }
  return meshFrom('awts-blue-depth-gradient-dome', positions, normals, colors, indices, [1,1,1,1]);
}
function skyColor(t, angle) { const horizon = 1 - t, sun = Math.max(0, Math.cos(angle + 2.25)) * Math.pow(horizon, 1.8), zen = Math.pow(t, .72), haze = Math.pow(horizon, 2.7); return [.12+zen*.10+haze*.48+sun*.44, .28+zen*.28+haze*.42+sun*.24, .48+zen*.45+haze*.22+sun*.06, 1]; }
function hazeRing() { return flatQuad('awts-horizon-air-haze', [0,3,-82], 210, 38, [0.86,.92,.92,.22]); }
function cloud(name, x, y, z, size) { return flatQuad(name, [x,y,z], size * 2.6, size * .62, [1,1,1,.18]); }
function flatQuad(name, center, width, height, color) { const [x,y,z]=center, hw=width/2, hh=height/2; return meshFrom(name, [x-hw,y-hh,z,x+hw,y-hh,z,x+hw,y+hh,z,x-hw,y+hh,z], [0,0,1,0,0,1,0,0,1,0,0,1], [...color,...color,...color,...color], [0,1,2,0,2,3], [1,1,1,color[3]]); }
function sunDisk(name, center, radius, color) { const c=v(center[0],center[1],center[2]), normal=normalize(v(-center[0],-center[1],-center[2])), right=normalize(v(normal.z,0,-normal.x)), up=normalize(v(normal.y*right.z,normal.z*right.x-normal.x*right.z,-normal.y*right.x)); const positions=[c.x,c.y,c.z], normals=[normal.x,normal.y,normal.z], colors=[...color], indices=[]; for(let i=0;i<=64;i++){const a=i/64*Math.PI*2; positions.push(c.x+(right.x*Math.cos(a)+up.x*Math.sin(a))*radius,c.y+(right.y*Math.cos(a)+up.y*Math.sin(a))*radius,c.z+(right.z*Math.cos(a)+up.z*Math.sin(a))*radius); normals.push(normal.x,normal.y,normal.z); colors.push(...color); if(i>0)indices.push(0,i,i+1);} const mesh=meshFrom(name,positions,normals,colors,indices,[1,1,1,color[3]??1]); mesh.material.transparent=(color[3]??1)<1; mesh.material.opacity=color[3]??1; mesh.material.alphaMode=mesh.material.transparent?'BLEND':'OPAQUE'; return mesh; }
function meshFrom(name, positions, normals, colors, indices, color) { const g = new BufferGeometry(); g.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3)); g.setAttribute('normal', new BufferAttribute(new Float32Array(normals), 3)); g.setAttribute('color', new BufferAttribute(new Float32Array(colors), 4)); g.setIndex(new BufferAttribute(new Uint16Array(indices), 1)); const mesh = new Mesh(g, new MeshStandardMaterial({ name, color })); mesh.name = name; mesh.material.transparent = (color[3] ?? 1) < 1; mesh.material.opacity = color[3] ?? 1; mesh.material.alphaMode = mesh.material.transparent ? 'BLEND' : 'OPAQUE'; mesh.setBaseTransform(); return mesh; }
