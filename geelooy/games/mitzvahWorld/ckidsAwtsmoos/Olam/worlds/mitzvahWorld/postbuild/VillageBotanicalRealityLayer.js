// B"H
/**
 * @file VillageBotanicalRealityLayer.js
 * @description
 * Chapter 1012: the road cuts the meadow and feeds the flowers.
 * The Awtsmoos makes road, lamps, flowers, shrubs, rocks, and clearings obey one
 * shared village ground law instead of floating as separate dreams.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { rvGroup, rvMesh, rvSeal } from "../../../../dvarim/nature/villagePicture/RealisticVillageMaterials.js?v=webgl-progress-materials-20260612-bh1";
import { ROAD_SPINE, yAt, roadMask, sealDecor } from "./VillagePolishGround.js?v=polish-ground-20260614-bh1";
const KEY = "__awtsmoosVillageBotanicalRealityLayer";
const R = (x,z,s=1) => { const v=Math.sin(x*12.9898+z*78.233+s*37.719)*43758.5453; return v-Math.floor(v); };
function add(g, kind, mat, x, y, z, s, rot = 0, op = {}) { const m = rvMesh(kind, mat, [x, y + s[1] * .5, z], s, [0, rot, 0], op); g.add(m); return m; }
function roadSlab(g, olam, x, z, yaw, len = 3.8) { const y=yAt(olam,x,z)+.018; const m=add(g,"box","yellowBrick",x,y,z,[3.15,.045,len],yaw,{repeat:3,simple:false}); m.userData.roadClearRadius=4.2; return m; }
function stem(g,x,y,z,h=.35){ add(g,"cylinder","leaf",x,y,z,[.025,h,.025],0,{repeat:1,simple:true}); }
function flower(g,olam,x,z,scale=1){ if(roadMask(x,z,3.8)>.55) return; const y=yAt(olam,x,z)+.02; stem(g,x,y,z,.28*scale); add(g,"sphere","flowerPetal",x,y+.28*scale,z,[.13*scale,.05*scale,.13*scale],0,{repeat:1,unlit:true}); add(g,"sphere","flowerPetal",x+.08*scale,y+.25*scale,z+.03*scale,[.09*scale,.04*scale,.09*scale],0,{repeat:1,unlit:true}); }
function flowerCluster(g,olam,x,z){ for(let i=0;i<14;i++){ const a=i*2.399, r=.22+(i%5)*.18; flower(g,olam,x+Math.cos(a)*r,z+Math.sin(a)*r,.7+(i%4)*.14); } }
function shrub(g,olam,x,z){ if(roadMask(x,z,4.5)>.35) return; const y=yAt(olam,x,z)+.035; for(let i=0;i<7;i++){ const a=i*1.26, r=.16+(i%3)*.11; add(g,"sphere","leaf",x+Math.cos(a)*r,y,z+Math.sin(a)*r,[.25,.2,.25],a,{repeat:1,simple:true}); } }
function rock(g,olam,x,z,sc=.8){ if(roadMask(x,z,3)>.5) return; add(g,"sphere","lichenRock",x,yAt(olam,x,z)+.018,z,[.55*sc,.3*sc,.42*sc],R(x,z)*6.28,{repeat:1,simple:false}); }
function lamp(g,olam,x,z,yaw=0,lit=false){ const y=yAt(olam,x,z); add(g,"box","darkWood",x,y,z,[.1,2.15,.1],yaw,{repeat:1,simple:true}); add(g,"box","darkWood",x,y+1.8,z,[.62,.08,.08],yaw,{repeat:1,simple:true}); add(g,"cylinder","lampShade",x+.28*Math.cos(yaw),y+1.58,z-.28*Math.sin(yaw),[.26,.34,.26],yaw,{repeat:1,unlit:true}); if(lit){ const l=new THREE.PointLight(0xffd58a,.42,6,2); l.position.set(x,y+1.62,z); g.add(l); } }
function buildRoad(g,olam){ let count=0; for(let i=0;i<ROAD_SPINE.length-1;i++){ const [x1,z1]=ROAD_SPINE[i], [x2,z2]=ROAD_SPINE[i+1], dx=x2-x1, dz=z2-z1, dist=Math.hypot(dx,dz), yaw=Math.atan2(dx,dz), steps=Math.max(1,Math.floor(dist/3.1)); const nx=Math.cos(yaw)*2.45, nz=-Math.sin(yaw)*2.45; for(let s=0;s<steps;s++){ const t=(s+.5)/steps, x=x1+dx*t, z=z1+dz*t; roadSlab(g,olam,x,z,yaw); count++; if(s%3===0){ flowerCluster(g,olam,x+nx,z+nz); flowerCluster(g,olam,x-nx,z-nz); } if(s%7===2) lamp(g,olam,x+nx*1.35,z+nz*1.35,yaw,count%3===0); if(s%6===1) shrub(g,olam,x-nx*1.55,z-nz*1.55); } } return count; }
function buildRocks(g,olam){ const spots=[[-172,-66],[-132,35],[-74,71],[15,-55],[74,-34],[168,95],[142,-92],[-192,96],[112,12],[34,34],[-36,35]]; for(const [x,z] of spots){ rock(g,olam,x,z,.8+R(x,z)*1.2); if(R(x,z,2)>.45) shrub(g,olam,x+1.1,z-.7); } return spots.length; }
export async function ensureVillageBotanicalRealityLayer(context={}) { const olam=context.olam||context, scene=context.scene||olam.scene; if(!scene||!olam||olam[KEY]) return olam?.[KEY]||null; const root=rvGroup("village_botanical_grounded_road_clearings_flowers_lamps"); const roadPieces=buildRoad(root,olam); const rocks=buildRocks(root,olam); rvSeal(root); sealDecor(root,{botanicalLayer:true}); scene.add(root); olam[KEY]=root; root.userData.stats={roadPieces,rocks,botanical:true,roadAware:true}; return root; }
