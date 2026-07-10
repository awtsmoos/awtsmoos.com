// B"H
import { BufferAttribute,BufferGeometry,Mesh,MeshStandardMaterial,Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh,primitiveColliders } from './Box3D.js';
import { createEdgeOverlay } from './EdgeOverlay.js';
import { PROCEDURAL_SOURCE } from './ProceduralBridge.js';
import { houseRoadSystem } from './PathRoadSystem.js';
import { TEXTURE_PURPOSES,TEXTURE_URLS } from '../assets/TextureCatalog.js';
import { mixRepeat,terrainRepeat,textureSize,REPEAT_HOOKS } from '../assets/TextureRepeat.js';
import { triangleNormal,v } from '../math/Geometry3D.js';
import { TriangleCollider } from '../collision/TriangleCollider.js';
const HALF='https://awtsmoos-docs-base.web.app/half-resolution/',FULL='https://awtsmoos-docs-base.web.app/full-resolution/';
export const GRASS_URLS=[`${FULL}grass%201.png`,`${HALF}grass%201.png`];
export const DIRT_URLS=[TEXTURE_URLS.terrain.dirtGrass3,TEXTURE_URLS.terrain.dirt1,TEXTURE_URLS.terrain.dirt2,TEXTURE_URLS.terrain.dirtGrass1,TEXTURE_URLS.terrain.dirtGrass2];
export const REAL_GRASS_URL=GRASS_URLS[0];
export function heightAt(x,z){return Math.sin(x*.021)*.32+Math.cos(z*.019)*.24+Math.sin((x+z)*.011)*.18;}

/** Full-resolution sources remain separate; the shader repeats each, then mixes by world mask. */
export function createTerrainPackage(obstacles,grassImage,dirtImage,groundSampler){
  const assets=obstacles.assets||{},terrain=terrainData(),road=houseRoadSystem(assets,groundSampler),roadColliders=road.colliders.flatMap(primitiveColliders),obstacleColliders=obstacles.flatMap(primitiveColliders),group=new Group();
  group.name='Awtsmoos_Eretz_measured_ground_full_resolution';group.add(groundMesh(terrain,grassImage,dirtImage));group.add(createPrimitiveMesh(road.visual));
  for(const def of obstacles){group.add(createPrimitiveMesh(def));if(!def.noEdge)group.add(createEdgeOverlay(def));}
  return{group,colliders:[...terrain.colliders,...roadColliders,...obstacleColliders],heightAt,stats:stats(terrain,roadColliders,obstacleColliders,obstacles,grassImage,dirtImage,road,groundSampler)};
}
function stats(terrain,roadColliders,obstacleColliders,obstacles,grassImage,dirtImage,road,sampler){const grassRep=terrainRepeat(terrain.size,grassImage),dirtRep=mixRepeat(terrain.size,dirtImage);return{terrainTriangles:terrain.colliders.length,terrainSize:terrain.size,terrainSteps:terrain.steps,roadTriangles:roadColliders.length,obstacleTriangles:obstacleColliders.length,obstacles:obstacles.length,edgeOverlays:obstacles.filter(o=>!o.noEdge).length,proceduralSource:`${PROCEDURAL_SOURCE} + measured placement`,grassUrl:grassImage?.src||null,dirtUrl:dirtImage?.src||null,originalTexturePolicy:true,mixedShader:true,grassRepeat:grassRep,dirtRepeat:dirtRep,repeatMode:'mirror-pingpong',groundSampler:sampler?.stats?.().mode||'terrain-height-phase-one',mixShader:'repeat-each-source-then-world-mask-mix',grassPixels:textureSize(grassImage),dirtPixels:textureSize(dirtImage),repeatHooks:REPEAT_HOOKS,road:{id:road.visual.id,colliders:roadColliders.length,segments:road.colliders.length,anchors:road.anchors,walkable:true}};}
function terrainData(size=540,steps=32){const vertices=[],uvs=[],indices=[],half=size/2;for(let iz=0;iz<=steps;iz++)for(let ix=0;ix<=steps;ix++){const x=-half+size*ix/steps,z=-half+size*iz/steps;vertices.push(v(x,heightAt(x,z),z));uvs.push(ix/steps,iz/steps);}for(let iz=0;iz<steps;iz++)for(let ix=0;ix<steps;ix++){const a=iz*(steps+1)+ix,b=a+1,c=a+steps+1,d=c+1;indices.push(a,c,b,b,c,d);}return{vertices,uvs,indices,size,steps,colliders:colliderList(vertices,indices)};}
function colliderList(vertices,indices){const out=[];for(let i=0;i<indices.length;i+=3)out.push(new TriangleCollider(vertices[indices[i]],vertices[indices[i+1]],vertices[indices[i+2]],{kind:'terrain',solid:true,floor:true}));return out;}
function groundMesh(data,grassImage,dirtImage){const g=new BufferGeometry(),grassRep=terrainRepeat(data.size,grassImage),dirtRep=mixRepeat(data.size,dirtImage);g.setAttribute('position',new BufferAttribute(new Float32Array(data.vertices.flatMap(p=>[p.x,p.y,p.z])),3));g.setAttribute('normal',new BufferAttribute(new Float32Array(vertexNormals(data.vertices,data.indices)),3));g.setAttribute('uv',new BufferAttribute(new Float32Array(data.uvs),2));g.setIndex(new BufferAttribute(new Uint16Array(data.indices),1));const mat=new MeshStandardMaterial({name:'Awtsmoos-full-resolution-mirrored-grass-dirt',color:[.95,1,.91,1]});Object.assign(mat,{mapImage:grassImage,mixImage:dirtImage,mapRepeat:grassRep,mixRepeat:dirtRep,mixStrength:.82,textureUrl:grassImage?.src||REAL_GRASS_URL,mixTextureUrl:dirtImage?.src||TEXTURE_PURPOSES.terrainMix,anisotropy:true,texturePolicy:{fullResolution:true,repeatMode:'mirror-pingpong',mixOrder:'repeat-each-source-then-world-mask-mix'}});const mesh=new Mesh(g,mat);mesh.name='eretz-full-resolution-world-mask-mix';mesh.setBaseTransform();return mesh;}
function vertexNormals(vertices,indices){const out=new Array(vertices.length).fill(0).map(()=>v());for(let i=0;i<indices.length;i+=3){const a=indices[i],b=indices[i+1],c=indices[i+2],n=triangleNormal(vertices[a],vertices[b],vertices[c]);for(const k of[a,b,c]){out[k].x+=n.x;out[k].y+=n.y;out[k].z+=n.z;}}return out.flatMap(n=>{const l=Math.hypot(n.x,n.y,n.z)||1;return[n.x/l,n.y/l,n.z/l];});}
