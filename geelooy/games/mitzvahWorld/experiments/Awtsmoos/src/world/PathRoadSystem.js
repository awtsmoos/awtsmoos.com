// B"H
import { houseRoadStart } from './House3D.js';

/** PathRoadSystem: smooth yellow-brick prism roads, walkable and present in collision. */
export function roadStripDef({ id = 'Awtsmoos-road-strip', points = [], width = 2.35, thickness = .16, texture, color = '#e8cc48', topOffset = .11, heightAt = () => 0, repeatScale = 1.15 }) {
  const smooth = smoothPoints(points, 6), vertices = [], faces = [];
  if (smooth.length < 2) return emptyRoad(id, texture, color);
  const normals = pointNormals(smooth);
  for (let i = 0; i < smooth.length; i++) { const p = smooth[i], n = normals[i], top = (p.y ?? heightAt(p.x, p.z)) + topOffset, bot = top - thickness; vertices.push([p.x+n.x*width/2,top,p.z+n.z*width/2], [p.x-n.x*width/2,top,p.z-n.z*width/2], [p.x+n.x*width/2,bot,p.z+n.z*width/2], [p.x-n.x*width/2,bot,p.z-n.z*width/2]); }
  for (let i = 0; i < smooth.length - 1; i++) { const a=i*4,b=a+4; faces.push([a,b,b+1,a+1], [a+2,a+3,b+3,b+2], [a,a+2,b+2,b], [a+1,b+1,b+3,a+3]); }
  faces.push([0,1,3,2], [(smooth.length-1)*4,(smooth.length-1)*4+2,(smooth.length-1)*4+3,(smooth.length-1)*4+1]);
  return { id, shape: 'manual', solid: true, walkable: true, color, position: { x:0,y:0,z:0 }, vertices, faces, rotation: { y:0 }, mapImage: texture || null, textureUrl: texture?.dataset?.url || texture?.src || null, mapRepeat: [repeatScale, Math.max(1, smooth.length * .12)] };
}
export function houseToMiddleRoad(assets, heightAt) {
  const start = houseRoadStart();
  return roadStripDef({ id: 'Awtsmoos-thick-smooth-yellow-brick-road-house-to-middle', texture: assets.yellowBrickImage, heightAt, points: [start, { x: 15.8, z: -10.8 }, { x: 10.4, z: -7.6 }, { x: 5.4, z: -4.2 }, { x: 1.1, z: -.9 }, { x: -1.0, z: 2.0 }] });
}
function emptyRoad(id, texture, color) { return { id, shape: 'manual', solid: true, walkable: true, color, position: { x:0,y:0,z:0 }, vertices: [], faces: [], rotation: { y:0 }, mapImage: texture || null }; }
function smoothPoints(points, cuts) { if (points.length < 3) return points; const out = []; for (let i = 0; i < points.length - 1; i++) { const p0 = points[Math.max(0,i-1)], p1 = points[i], p2 = points[i+1], p3 = points[Math.min(points.length-1,i+2)]; for (let j = 0; j < cuts; j++) out.push(catmull(p0,p1,p2,p3,j/cuts)); } out.push(points[points.length-1]); return out; }
function catmull(p0,p1,p2,p3,t) { const t2=t*t,t3=t2*t, f=(a,b,c,d)=>.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3); return { x:f(p0.x,p1.x,p2.x,p3.x), z:f(p0.z,p1.z,p2.z,p3.z), y:p1.y==null?undefined:f(p0.y??0,p1.y??0,p2.y??0,p3.y??0) }; }
function pointNormals(points) { return points.map((p,i)=>{ const a=points[Math.max(0,i-1)], b=points[Math.min(points.length-1,i+1)], dx=b.x-a.x, dz=b.z-a.z, l=Math.hypot(dx,dz)||1; return { x:-dz/l, z:dx/l }; }); }
