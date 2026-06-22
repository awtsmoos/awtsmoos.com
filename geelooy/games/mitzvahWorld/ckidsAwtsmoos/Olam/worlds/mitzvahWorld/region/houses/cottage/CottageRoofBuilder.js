// B"H
/** @file CottageRoofBuilder.js @description Roof rafters, shingles, ridge beam, and chimney builder. */
import * as THREE from "/games/scripts/build/three.module.js";
import { COTTAGE_BRICK_PALETTE as P } from "../CottageBrickPalette.js";
import { cottageStyleProfile } from "./CottageStyleProfiles.js";
import { materialWithTexture } from "../../../materials/ProceduralTextureKit.js?v=ping-pong-crisp-textures-20260622-bh1";
function mat(color){ return new THREE.MeshLambertMaterial({ color, transparent:false, opacity:1, depthWrite:true, depthTest:true }); }
function roofMat(color){ const m=materialWithTexture("brick",{ size:256 }); m.color.set(color); m.name="textured_low_draw_cottage_roof"; return m; }
function box(name,size,pos,color,data={}){ const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat(color)); m.name=name; m.position.set(...pos); Object.assign(m.userData||={},data,{cottageRoofPart:true,opacitySealed:true}); return m; }
function gableMesh(name,w,d,rise,color,data={}){ const shape=new THREE.Shape(); shape.moveTo(-w/2,0); shape.lineTo(0,rise); shape.lineTo(w/2,0); shape.lineTo(-w/2,0); const geo=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false}); geo.translate(0,0,-d/2); const mesh=new THREE.Mesh(geo,roofMat(color)); mesh.name=name; mesh.receiveShadow=true; Object.assign(mesh.userData||={},data,{cottageRoofPart:true,cleanGable:true,texturedRoof:true,opacitySealed:true}); return mesh; }
export function buildCottageRoof(house={}, spec={}){ const style=cottageStyleProfile(house), root=new THREE.Group(), w=(spec.width||house.sx||6.2)+.9, d=(spec.depth||house.sz||5.4)+.9, h=(spec.height||house.sy||3.2)+.14, rise=Math.max(.82,w*.22), roofColor=style.roof||P.roof.color; root.name=`cottage_roof_system_${house.id}`; const roof=gableMesh(`${house.id}_single_clean_gable_roof`,w,d,rise,roofColor,{visualOnly:true,roofGable:true,lowDrawRoof:true}); roof.position.y=h; root.add(roof); root.add(box(`${house.id}_ridge_beam`,[.22,.2,d+.24],[0,h+rise+.08,0],P.beam.color,{ridge:true,lowDrawRoof:true})); root.add(box(`${house.id}_chimney`,[.42,.9,.42],[w*.22,h+rise+.42,-d*.18],P.foundation.color,{chimney:true, smokeKind:style.smoke,lowDrawRoof:true})); Object.assign(root.userData||={}, { lowDrawRoof:true, texturedRoof:true, roofMeshes:3 }); return root; }
export default buildCottageRoof;
