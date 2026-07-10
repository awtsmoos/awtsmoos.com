// B"H
import { houseAnchors, houseRoadStart } from './House3D.js';
import { roadRepeat } from '../assets/TextureRepeat.js';

/** PathRoadSystem: longer modular roads; visual strip is one mesh, collision is cheap boxes. */
export function houseRoadSystem(assets, heightAt) {
  const anchors = roadAnchors(), pts = [anchors.house, anchors.frontStairs, anchors.approach, anchors.plaza, anchors.oldJunk, anchors.npc, anchors.futureHouse, anchors.fieldEnd];
  return { anchors, visual: roadStripDef({ texture: assets.yellowBrickImage, heightAt, points: pts }), colliders: roadColliderDefs(pts, assets.yellowBrickImage, heightAt) };
}
export function roadAnchors() { const h = houseAnchors(); return { house: h.frontDoor, frontStairs: h.frontStairs, approach:{x:45,z:-31}, plaza:{x:31,z:-22}, oldJunk:{x:13,z:-9}, npc:{x:-1,z:2}, futureHouse:{x:-27,z:13}, fieldEnd:{x:-58,z:31} }; }
export function roadStripDef({ id='Awtsmoos-long-fast-yellow-brick-road-visual', points=[], width=3.25, thickness=.14, texture, color='#e8cc48', topOffset=.13, heightAt=()=>0 }) {
  const smooth = smoothPoints(points, 3), vertices = [], faces = [], total = pathLength(smooth); if (smooth.length < 2) return emptyRoad(id, texture, color);
  const normals = pointNormals(smooth); for (let i=0;i<smooth.length;i++) { const p=smooth[i], n=normals[i], top=(p.y??heightAt(p.x,p.z))+topOffset, bot=top-thickness; vertices.push([p.x+n.x*width/2,top,p.z+n.z*width/2],[p.x-n.x*width/2,top,p.z-n.z*width/2],[p.x+n.x*width/2,bot,p.z+n.z*width/2],[p.x-n.x*width/2,bot,p.z-n.z*width/2]); }
  for (let i=0;i<smooth.length-1;i++) { const a=i*4,b=a+4; faces.push([a,b,b+1,a+1],[a,a+2,b+2,b],[a+1,b+1,b+3,a+3]); }
  return roadDef(id, color, texture, vertices, faces, roadRepeat(width,total,texture), { totalLength:total, points:smooth.length });
}
function roadColliderDefs(points, texture, heightAt, width=3.35) { const defs=[]; for (let i=0;i<points.length-1;i++) { const a=points[i],b=points[i+1],x=(a.x+b.x)/2,z=(a.z+b.z)/2,len=Math.hypot(b.x-a.x,b.z-a.z),yaw=Math.atan2(b.x-a.x,b.z-a.z),y=(heightAt(x,z)||0)+.1; defs.push({ id:`Awtsmoos-cheap-road-step-${i+1}`, shape:'box', solid:true, walkable:true, noEdge:true, color:'#e8cc48', mapImage:texture||null, textureUrl:texture?.dataset?.url||texture?.src||null, mapRepeat:roadRepeat(width,len,texture), position:{x,y,z}, size:{x:width,y:.16,z:len+.5}, rotation:{y:yaw} }); } return defs; }
function roadDef(id,color,texture,vertices,faces,repeat,meta) { return { id, shape:'manual', solid:false, walkable:true, noEdge:true, color, position:{x:0,y:0,z:0}, vertices, faces, rotation:{y:0}, mapImage:texture||null, textureUrl:texture?.dataset?.url||texture?.src||null, mapRepeat:repeat, userData:{ AwtsmoosRoad:meta } }; }
function emptyRoad(id, texture, color) { return roadDef(id,color,texture,[],[],[1,1],{}); }
function smoothPoints(points, cuts) { if (points.length < 3) return points; const out=[]; for (let i=0;i<points.length-1;i++) { const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)]; for (let j=0;j<cuts;j++) out.push(catmull(p0,p1,p2,p3,j/cuts)); } out.push(points[points.length-1]); return out; }
function catmull(p0,p1,p2,p3,t) { const t2=t*t,t3=t2*t,f=(a,b,c,d)=>.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3); return { x:f(p0.x,p1.x,p2.x,p3.x), z:f(p0.z,p1.z,p2.z,p3.z), y:p1.y==null?undefined:f(p0.y??0,p1.y??0,p2.y??0,p3.y??0) }; }
function pointNormals(points) { return points.map((p,i)=>{ const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1; return { x:-dz/l, z:dx/l }; }); }
function pathLength(points) { let n=0; for (let i=1;i<points.length;i++) n+=Math.hypot(points[i].x-points[i-1].x,points[i].z-points[i-1].z); return n; }
