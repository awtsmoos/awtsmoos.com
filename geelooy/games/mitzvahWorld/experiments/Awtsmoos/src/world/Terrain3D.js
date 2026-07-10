// B"H
import { BufferAttribute,BufferGeometry,Mesh,MeshStandardMaterial,Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh,primitiveColliders } from './Box3D.js';
import { createEdgeOverlay } from './EdgeOverlay.js';
import { PROCEDURAL_SOURCE } from './ProceduralBridge.js';
import { houseRoadSystem } from './PathRoadSystem.js';
import { TEXTURE_URLS } from '../assets/TextureCatalog.js';
import { terrainRepeat,textureSize,REPEAT_HOOKS } from '../assets/TextureRepeat.js';
import { triangleNormal,v } from '../math/Geometry3D.js';
import { TriangleCollider } from '../collision/TriangleCollider.js';
const HALF='https://awtsmoos-docs-base.web.app/half-resolution/',FULL='https://awtsmoos-docs-base.web.app/full-resolution/';
export const GRASS_URLS=[`${FULL}grass%201.png`,`${HALF}grass%201.png`];
export const DIRT_URLS=[TEXTURE_URLS.terrain.dirtGrass3,TEXTURE_URLS.terrain.dirt1];
export const REAL_GRASS_URL=GRASS_URLS[0];
export function heightAt(x,z){return Math.sin(x*.021)*.32+Math.cos(z*.019)*.24+Math.sin((x+z)*.011)*.18;}

/** One full-resolution grass source, one draw call, no dirt mix and no procedural noise. */
export function createTerrainPackage(obstacles,grassImage,_unusedDirtImage,groundSampler){
  const assets=obstacles.assets||{},terrain=terrainData(),road=houseRoadSystem(assets,groundSampler),roadColliders=road.colliders.flatMap(primitiveColliders),obstacleColliders=obstacles.flatMap(primitiveColliders),group=new Group();
  group.name='Awtsmoos_Eretz_single_full_resolution_grass';group.add(groundMesh(terrain,grassImage));group.add(createPrimitiveMesh(road.visual));
  for(const def of obstacles){group.add(createPrimitiveMesh(def));if(!def.noEdge)group.add(createEdgeOverlay(def));}
  return{group,colliders:[...terrain.colliders,...roadColliders,...obstacleColliders],heightAt,stats:stats(terrain,roadColliders,obstacleColliders,obstacles,grassImage,road,groundSampler)};
}
function stats(terrain,roadColliders,obstacleColliders,obstacles,grassImage,road,sampler){const repeat=terrainRepeat(terrain.size,grassImage),pixels=textureSize(grassImage);return{terrainTriangles:terrain.colliders.length,terrainSize:terrain.size,terrainSteps:terrain.steps,roadTriangles:roadColliders.length,obstacleTriangles:obstacleColliders.length,obstacles:obstacles.length,proceduralSource:`${PROCEDURAL_SOURCE} + mobile collision proxies`,grassUrl:grassImage?.src||null,grassRepeat:repeat,dirtRepeat:null,repeatMode:'mirror-pingpong',groundSampler:sampler?.stats?.().mode||'terrain-height-phase-one',mixShader:'disabled-grass-only',grassPixels:pixels,texelsPerWorld:REPEAT_HOOKS.terrainTexelsPerWorld,textureWorldSize:[pixels.w/REPEAT_HOOKS.terrainTexelsPerWorld,pixels.h/REPEAT_HOOKS.terrainTexelsPerWorld],road:{id:road.visual.id,colliders:roadColliders.length,segments:road.colliders.length,anchors:road.anchors,walkable:true}};}
function terrainData(size=540,steps=28){const vertices=[],uvs=[],indices=[],half=size/2;for(let iz=0;iz<=steps;iz++)for(let ix=0;ix<=steps;ix++){const x=-half+size*ix/steps,z=-half+size*iz/steps;vertices.push(v(x,heightAt(x,z),z));uvs.push(ix/steps,iz/steps);}for(let iz=0;iz<steps;iz++)for(let ix=0;ix<steps;ix++){const a=iz*(steps+1)+ix,b=a+1,c=a+steps+1,d=c+1;indices.push(a,c,b,b,c,d);}return{vertices,uvs,indices,size,steps,colliders:colliderList(vertices,indices)};}
function colliderList(vertices,indices){const out=[];for(let i=0;i<indices.length;i+=3)out.push(new TriangleCollider(vertices[indices[i]],vertices[indices[i+1]],vertices[indices[i+2]],{kind:'terrain',solid:true,floor:true}));return out;}
function groundMesh(data,grassImage){const g=new BufferGeometry(),repeat=terrainRepeat(data.size,grassImage);g.setAttribute('position',new BufferAttribute(new Float32Array(data.vertices.flatMap(p=>[p.x,p.y,p.z])),3));g.setAttribute('normal',new BufferAttribute(new Float32Array(vertexNormals(data.vertices,data.indices)),3));g.setAttribute('uv',new BufferAttribute(new Float32Array(data.uvs),2));g.setIndex(new BufferAttribute(new Uint16Array(data.indices),1));const mat=new MeshStandardMaterial({name:'Awtsmoos-readable-full-resolution-grass',color:[1,1,1,1]});Object.assign(mat,{mapImage:grassImage,mixImage:null,mapRepeat:repeat,mixRepeat:[1,1],mixStrength:0,textureUrl:grassImage?.src||REAL_GRASS_URL,anisotropy:2,texturePolicy:{fullResolution:true,repeatMode:'mirror-pingpong',mix:'disabled',sourcePixels:textureSize(grassImage),texelsPerWorld:REPEAT_HOOKS.terrainTexelsPerWorld}});const mesh=new Mesh(g,mat);mesh.name='eretz-full-resolution-grass-only';mesh.setBaseTransform();return mesh;}
function vertexNormals(vertices,indices){const out=new Array(vertices.length).fill(0).map(()=>v());for(let i=0;i<indices.length;i+=3){const a=indices[i],b=indices[i+1],c=indices[i+2],n=triangleNormal(vertices[a],vertices[b],vertices[c]);for(const k of[a,b,c]){out[k].x+=n.x;out[k].y+=n.y;out[k].z+=n.z;}}return out.flatMap(n=>{const l=Math.hypot(n.x,n.y,n.z)||1;return[n.x/l,n.y/l,n.z/l];});}
