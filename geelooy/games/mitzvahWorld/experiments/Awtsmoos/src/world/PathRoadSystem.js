// B"H
import { houseAllAnchors } from './House3D.js';
import { REPEAT_HOOKS, roadRepeat } from '../assets/TextureRepeat.js';

/** PathRoadSystem: one road mesh can contain many branches, each with path-distance UVs. */
export function houseRoadSystem(assets, heightAt) {
  const anchors = roadAnchors(), texture = assets.yellowBrickImage, routes = roadRoutes(anchors);
  return { anchors, routes: routes.map(r => r.id), visual: roadNetworkDef({ texture, heightAt, routes }), colliders: routes.flatMap(r => roadColliderDefs(r.points, texture, heightAt, r.id)) };
}
export function roadAnchors() {
  const all = houseAllAnchors(), [wash, far, side, courtyard] = all.district;
  return { main: all.main, wash, far, side, courtyard, approach:{x:45,z:-31}, plaza:{x:31,z:-22}, oldJunk:{x:13,z:-9}, npc:{x:-1,z:2}, bend:{x:-13,z:8}, sideBend:{x:55,z:-18}, courtBend:{x:4,z:18} };
}
function roadRoutes(a) { return [
  { id:'main-to-wash-far', points:[a.main.frontDoor,a.main.frontStairs,a.approach,a.plaza,a.oldJunk,a.npc,a.bend,a.wash.frontDoor,a.far.frontDoor] },
  { id:'plaza-to-side-study', points:[a.plaza,a.sideBend,a.side.frontDoor] },
  { id:'junk-to-courtyard-house', points:[a.oldJunk,a.courtBend,a.courtyard.frontDoor] }
]; }
export function roadNetworkDef({ id='Awtsmoos-wide-normal-uv-yellow-brick-road-network', routes=[], width=5.05, thickness=.16, texture, color='#e8cc48', topOffset=.15, heightAt=()=>0 }) {
  const vertices=[], faces=[], uvs=[], meta=[];
  for (const route of routes) { const part = roadStripPart(route.points, width, thickness, topOffset, heightAt); append(vertices, faces, uvs, part); meta.push({ id:route.id, length:part.length, points:part.points }); }
  return roadDef(id, color, texture, vertices, faces, uvs, [1,1], { routes:meta, uvMode:'path-distance', tileWorld:REPEAT_HOOKS.roadPanelWorld, width });
}
function roadStripPart(points, width, thickness, topOffset, heightAt) {
  const smooth=smoothPoints(points,3), normals=pointNormals(smooth), dist=distances(smooth), vertices=[], faces=[], uvs=[];
  for (let i=0;i<smooth.length;i++) { const p=smooth[i], n=normals[i], top=(p.y??heightAt(p.x,p.z))+topOffset, bot=top-thickness, v=dist[i]/REPEAT_HOOKS.roadPanelWorld; vertices.push([p.x+n.x*width/2,top,p.z+n.z*width/2],[p.x-n.x*width/2,top,p.z-n.z*width/2],[p.x+n.x*width/2,bot,p.z+n.z*width/2],[p.x-n.x*width/2,bot,p.z-n.z*width/2]); uvs.push(0,v,1,v,0,v,1,v); }
  for (let i=0;i<smooth.length-1;i++) { const a=i*4,b=a+4; faces.push([a,b,b+1,a+1],[a,a+2,b+2,b],[a+1,b+1,b+3,a+3]); }
  return { vertices, faces, uvs, length:dist[dist.length-1]||0, points:smooth.length };
}
function append(vertices, faces, uvs, part) { const offset=vertices.length; vertices.push(...part.vertices); uvs.push(...part.uvs); for (const f of part.faces) faces.push(f.map(i=>i+offset)); }
function roadColliderDefs(points, texture, heightAt, routeId, width=5.12) { const defs=[]; for (let i=0;i<points.length-1;i++) { const a=points[i], b=points[i+1], x=(a.x+b.x)/2, z=(a.z+b.z)/2, len=Math.hypot(b.x-a.x,b.z-a.z), yaw=Math.atan2(b.x-a.x,b.z-a.z), y=(heightAt(x,z)||0)+.11; defs.push({ id:`Awtsmoos-wide-road-collider-${routeId}-${i+1}`, shape:'box', solid:true, walkable:true, noEdge:true, color:'#e8cc48', mapImage:texture||null, textureUrl:texture?.dataset?.url||texture?.src||null, mapRepeat:roadRepeat(width,len,texture), position:{x,y,z}, size:{x:width,y:.18,z:len+.8}, rotation:{y:yaw} }); } return defs; }
function roadDef(id,color,texture,vertices,faces,uvs,repeat,meta) { return { id, shape:'manual', solid:false, walkable:true, noEdge:true, color, position:{x:0,y:0,z:0}, vertices, faces, uvs, rotation:{y:0}, mapImage:texture||null, textureUrl:texture?.dataset?.url||texture?.src||null, mapRepeat:repeat, userData:{ AwtsmoosRoad:meta } }; }
function smoothPoints(points, cuts) { if (points.length < 3) return points; const out=[]; for (let i=0;i<points.length-1;i++) { const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)]; for (let j=0;j<cuts;j++) out.push(catmull(p0,p1,p2,p3,j/cuts)); } out.push(points[points.length-1]); return out; }
function catmull(p0,p1,p2,p3,t) { const t2=t*t,t3=t2*t,f=(a,b,c,d)=>.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3); return { x:f(p0.x,p1.x,p2.x,p3.x), z:f(p0.z,p1.z,p2.z,p3.z), y:p1.y==null?undefined:f(p0.y??0,p1.y??0,p2.y??0,p3.y??0) }; }
function pointNormals(points) { return points.map((p,i)=>{ const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1; return { x:-dz/l, z:dx/l }; }); }
function distances(points) { const out=[0]; for (let i=1;i<points.length;i++) out[i]=out[i-1]+Math.hypot(points[i].x-points[i-1].x,points[i].z-points[i-1].z); return out; }
