// B"H
/** @file CottageYardPropBuilder.js @description Profession-specific visible yard props and story objects. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { cottageStyleProfile } from "./CottageStyleProfiles.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
function mat(color){ return new THREE.MeshLambertMaterial({ color, transparent:false, opacity:1, depthWrite:true, depthTest:true }); }
function box(name,size,pos,color,data={}){ const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat(color)); m.name=name; m.position.set(...pos); Object.assign(m.userData||={},data,{cottageYardProp:true,opacitySealed:true,skipOctree:true,noOctree:true}); return m; }
function prop(root,house,kind,i){ const x=-2.4+i*.82, z=3.25+(i%2)*.42; const color=kind.includes("flower")?0x9bd66a:kind.includes("coal")?0x171717:kind.includes("cloth")?0x9a6cd1:0x7a5635; root.add(box(`${house.id}_yard_${kind}_${i}`,[.42,.42,.42],[x,.25,z],color,{yardKind:kind, visualStory:true})); }
export function buildCottageYardProps(house={}){ const root=new THREE.Group(); root.name=`cottage_yard_story_props_${house.id}`; const style=cottageStyleProfile(house); (style.yard||["woodpile","bucket"]).forEach((kind,i)=>prop(root,house,kind,i)); root.userData={yardStoryProps:true, houseId:house.id, propCount:root.children.length}; return root; }
export default buildCottageYardProps;
