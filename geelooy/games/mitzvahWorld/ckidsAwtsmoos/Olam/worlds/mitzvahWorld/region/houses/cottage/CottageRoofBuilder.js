// B"H
/** @file CottageRoofBuilder.js @description Roof rafters, shingles, ridge beam, and chimney builder. */
import * as THREE from "/games/scripts/build/three.module.js";
import { COTTAGE_BRICK_PALETTE as P } from "../CottageBrickPalette.js";
import { cottageStyleProfile } from "./CottageStyleProfiles.js";
function mat(color){ return new THREE.MeshLambertMaterial({ color, transparent:false, opacity:1, depthWrite:true, depthTest:true }); }
function box(name,size,pos,color,data={}){ const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat(color)); m.name=name; m.position.set(...pos); Object.assign(m.userData||={},data,{cottageRoofPart:true,opacitySealed:true}); return m; }
export function buildCottageRoof(house={}, spec={}){ const style=cottageStyleProfile(house), root=new THREE.Group(), w=(spec.width||house.sx||6.2)+.9, d=(spec.depth||house.sz||5.4)+.9, h=(spec.height||house.sy||3.2)+.42; root.name=`cottage_roof_system_${house.id}`; for(const side of [-1,1]){ const roof=box(`${house.id}_roof_plane_${side}`,[w*.58,.16,d], [side*w*.18,h,d*.02], style.roof||P.roof.color, {visualOnly:true, roofPlane:true}); roof.rotation.z=side*.58; root.add(roof); } root.add(box(`${house.id}_ridge_beam`,[.22,.22,d+.2],[0,h+.28,0],P.beam.color,{ridge:true})); for(let i=0;i<7;i++){ const z=-d/2+i*d/6; root.add(box(`${house.id}_rafter_${i}`,[w*.92,.08,.08],[0,h+.04,z],P.beam.color,{rafter:true})); } root.add(box(`${house.id}_chimney`,[.42,.9,.42],[w*.22,h+.68,-d*.18],P.foundation.color,{chimney:true, smokeKind:style.smoke})); return root; }
export default buildCottageRoof;
