// B"H
/**
 * @file VillageLandmarkLayer.js
 * @description
 * Chapter 1006: the village receives names a child can remember.
 * A square, well, study grove, orchard sign, gate stones, and great tree roots
 * become the map's grammar. The Awtsmoos makes location into memory.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { rvGroup, rvMesh, rvSeal } from "../../../../dvarim/nature/villagePicture/RealisticVillageMaterials.js?v=webgl-progress-materials-20260612-bh1";
import { LANDMARKS, groundedGroup, sealDecor } from "./VillagePolishGround.js?v=polish-ground-20260614-bh1";
const KEY="__awtsmoosVillageLandmarkLayer";
function add(g,kind,mat,x,y,z,s,r=0){ const m=rvMesh(kind,mat,[x,y+s[1]*.5,z],s,[0,r,0],{repeat:2,simple:false}); g.add(m); return m; }
function ring(root,mat,radius,count,y=.015){ for(let i=0;i<count;i++){ const a=i/count*Math.PI*2; add(root,"box",mat,Math.cos(a)*radius,y,Math.sin(a)*radius,[1.5,.06,.42],a); } }
function well(root){ ring(root,"lichenRock",1.15,14,.02); add(root,"cylinder","darkWood",0,.05,0,[.24,1.4,.24]); add(root,"box","darkWood",0,1.35,0,[2.4,.16,.22]); add(root,"cylinder","lampShade",0,1.05,0,[.48,.34,.48]); }
function studyBenches(root){ for(let i=0;i<5;i++){ const z=(i-2)*1.1; add(root,"box","wood",-1.7,.08,z,[1.4,.18,.28]); add(root,"box","wood",1.7,.08,z,[1.4,.18,.28]); } add(root,"box","marbleWhite",0,.05,0,[1.2,.18,1.2]); }
function greatTree(root){ add(root,"cylinder","darkWood",0,0,0,[1.25,9,1.25]); for(let i=0;i<9;i++){ const a=i*.698; add(root,"cylinder","darkWood",Math.cos(a)*1.25,.06,Math.sin(a)*1.25,[.22,3.2,.22],a); } add(root,"sphere","leaf",0,8.5,0,[7.4,3.2,7.4]); add(root,"sphere","leaf",-2.4,7.2,1.1,[4.2,2.1,4.2]); add(root,"sphere","leaf",2.2,7.6,-1.5,[4.6,2.2,4.6]); }
function sign(root,label=""){ add(root,"box","darkWood",0,.03,0,[.16,1.4,.16]); const s=add(root,"box","wood",0,.9,0,[1.8,.62,.12]); s.userData.label=label; }
function place(root,olam,name,fn){ const [x,z]=LANDMARKS[name]; const g=groundedGroup(`landmark_${name}`,olam,x,z); fn(g); root.add(g); }
function build(olam){ const root=rvGroup("village_named_landmarks_square_well_grove_gate"); place(root,olam,"square",g=>{ ring(g,"yellowBrick",9,32); ring(g,"rug",5.2,18,.03); }); place(root,olam,"well",well); place(root,olam,"study",studyBenches); place(root,olam,"greatTree",greatTree); place(root,olam,"orchard",g=>sign(g,"Orchard")); place(root,olam,"gate",g=>{ add(g,"box","lichenRock",-1.3,.05,0,[.9,2.6,.9]); add(g,"box","lichenRock",1.3,.05,0,[.9,2.6,.9]); add(g,"box","darkWood",0,2.45,0,[3.8,.22,.32]); }); rvSeal(root); return sealDecor(root,{villageLandmark:true}); }
export async function ensureVillageLandmarkLayer(context={}){ const olam=context.olam||context, scene=context.scene||olam.scene; if(!scene||!olam||olam[KEY]) return olam?.[KEY]||null; const root=build(olam); scene.add(root); olam[KEY]=root; return root; }
