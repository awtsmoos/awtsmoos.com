// B"H
import { houseAllAnchors } from './House3D.js';
import { REPEAT_HOOKS } from '../assets/TextureRepeat.js';

/**
 * Roads use one UV language: world distance divided by roadTileWorld. The
 * material repeat remains [1,1], preventing double scaling and invalid UVs.
 */
export function houseRoadSystem(assets,groundSampler){
  const anchors=roadAnchors(),texture=assets.yellowBrickImage,routes=roadRoutes(anchors);
  return{
    anchors,
    routes:routes.map(route=>route.id),
    visual:roadNetworkDef({texture,groundSampler,routes}),
    colliders:routes.flatMap(route=>roadColliderDefs(route.points,groundSampler,route.id))
  };
}

export function roadAnchors(){
  const all=houseAllAnchors(),district=all.district;
  return{main:all.main,district,approach:{x:45,z:-31},plaza:{x:31,z:-22},oldJunk:{x:13,z:-9},npc:{x:-1,z:2},bend:{x:-13,z:8},sideBend:{x:55,z:-18},courtBend:{x:4,z:18},farWest:{x:-50,z:22},eastFork:{x:69,z:10},southFork:{x:70,z:-36},northFork:{x:13,z:24}};
}

export function roadNetworkDef({id='Awtsmoos-measured-yellow-brick-road-network',routes=[],width=6.2,thickness=.18,texture,color='#ffffff',groundSampler}){
  const vertices=[],faces=[],uvs=[],meta=[];
  for(const route of routes){
    const part=roadStripPart(route.points,width,thickness,groundSampler);
    append(vertices,faces,uvs,part);
    meta.push({id:route.id,length:part.length,points:part.points,uvMax:part.uvMax});
  }
  return roadDef(id,color,texture,vertices,faces,uvs,{routes:meta,uvMode:'world-distance-single-repeat',tileWorld:REPEAT_HOOKS.roadTileWorld,width,groundSampler:'terrain-height/raycast'});
}

function roadRoutes(a){
  const d=a.district,routes=[{id:'main-spine-to-old-junk',points:[a.main.frontDoor,a.main.frontStairs,a.approach,a.plaza,a.oldJunk,a.npc,a.bend]}];
  const hubs=[a.bend,a.farWest,a.eastFork,a.northFork,a.southFork,a.oldJunk];
  for(let i=0;i<d.length;i++){
    const hub=nearestHub(d[i].frontDoor,hubs);
    routes.push({id:`branch-to-${safe(d[i].id)}`,points:[hub,mid(hub,d[i].frontDoor,i),d[i].frontDoor]});
  }
  return routes;
}

function roadStripPart(points,width,thickness,sampler){
  const smooth=smoothPoints(points,4),normals=pointNormals(smooth),along=distances(smooth),vertices=[],faces=[],uvs=[];
  const tile=REPEAT_HOOKS.roadTileWorld,uMax=width/tile;
  for(let i=0;i<smooth.length;i++){
    const p=smooth[i],n=normals[i],left={x:p.x+n.x*width/2,z:p.z+n.z*width/2},right={x:p.x-n.x*width/2,z:p.z-n.z*width/2};
    const ly=sampler.heightAt(left.x,left.z).y+.12,ry=sampler.heightAt(right.x,right.z).y+.12,v=along[i]/tile;
    vertices.push([left.x,ly,left.z],[right.x,ry,right.z],[left.x,ly-thickness,left.z],[right.x,ry-thickness,right.z]);
    uvs.push(0,v,uMax,v,0,v,uMax,v);
  }
  for(let i=0;i<smooth.length-1;i++){
    const a=i*4,b=a+4;
    faces.push([a,b,b+1,a+1],[a,a+2,b+2,b],[a+1,b+1,b+3,a+3]);
  }
  return{vertices,faces,uvs,length:along.at(-1)||0,points:smooth.length,uvMax:{u:uMax,v:(along.at(-1)||0)/tile}};
}

function roadColliderDefs(points,sampler,routeId,width=6.25){
  const smooth=smoothPoints(points,4),defs=[];
  for(let i=0;i<smooth.length-1;i++){
    const a=smooth[i],b=smooth[i+1],x=(a.x+b.x)/2,z=(a.z+b.z)/2,len=Math.hypot(b.x-a.x,b.z-a.z),yaw=Math.atan2(b.x-a.x,b.z-a.z);
    const y=(sampler.heightAt(a.x,a.z).y+sampler.heightAt(b.x,b.z).y)/2+.05;
    defs.push({id:`Awtsmoos-measured-road-collider-${routeId}-${i+1}`,shape:'box',solid:true,walkable:true,noEdge:true,visible:false,color:'#000000',position:{x,y,z},size:{x:width,y:.22,z:len+.35},rotation:{y:yaw}});
  }
  return defs;
}

function roadDef(id,color,texture,vertices,faces,uvs,meta){
  return{id,shape:'manual',solid:false,walkable:true,noEdge:true,color,position:{x:0,y:0,z:0},vertices,faces,uvs,rotation:{y:0},mapImage:texture||null,textureUrl:texture?.dataset?.publicUrl||texture?.dataset?.url||texture?.src||null,mapRepeat:[1,1],anisotropy:2,texturePolicy:{fullResolution:true,projection:'path-distance',tileWorld:REPEAT_HOOKS.roadTileWorld,repeatMode:'mirror-pingpong'},userData:{AwtsmoosRoad:{...meta,textureLoaded:!!texture,textureFallback:texture?.dataset?.fallback==='true',textureUrl:texture?.dataset?.publicUrl||texture?.src||null}}};
}

function append(vertices,faces,uvs,part){const offset=vertices.length;vertices.push(...part.vertices);uvs.push(...part.uvs);for(const face of part.faces)faces.push(face.map(index=>index+offset));}
function smoothPoints(points,cuts){if(points.length<3)return points;const out=[];for(let i=0;i<points.length-1;i++){const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];for(let j=0;j<cuts;j++)out.push(catmull(p0,p1,p2,p3,j/cuts));}out.push(points.at(-1));return out;}
function catmull(p0,p1,p2,p3,t){const t2=t*t,t3=t2*t,f=(a,b,c,d)=>.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3);return{x:f(p0.x,p1.x,p2.x,p3.x),z:f(p0.z,p1.z,p2.z,p3.z)};}
function pointNormals(points){return points.map((point,index)=>{const a=points[Math.max(0,index-1)],b=points[Math.min(points.length-1,index+1)],dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz)||1;return{x:-dz/length,z:dx/length};});}
function distances(points){const out=[0];for(let i=1;i<points.length;i++)out[i]=out[i-1]+Math.hypot(points[i].x-points[i-1].x,points[i].z-points[i-1].z);return out;}
function nearestHub(point,hubs){return hubs.reduce((best,hub)=>distance(point,hub)<distance(point,best)?hub:best,hubs[0]);}
function distance(a,b){return Math.hypot(a.x-b.x,a.z-b.z);}
function mid(a,b,index){return{x:a.x+(b.x-a.x)*.45+Math.sin(index*2.3)*5.5,z:a.z+(b.z-a.z)*.45+Math.cos(index*1.7)*4.5};}
function safe(id){return String(id||'house').replace(/[^a-z0-9]+/gi,'-');}
