// B"H
/**
 * @file VillageEcologyRealityLayer.js
 * @description
 * Chapter 1013: ecology stops being a scatter and becomes a map.
 * Road edges grow trampled details, the square stays clean, the grove receives
 * mushrooms and roots, the orchard receives bundles, and everything is grounded.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { ecologyAt, ecologyRand, ecologyStats } from "../../../../dvarim/nature/villagePicture/VillageEcologyAtlas.js?v=village-ecology-atlas-20260612-bh1";
import { ecologyMaterial, ecologyMaterialStats } from "../../../../dvarim/nature/villagePicture/EcologySpecialMaterials.js?v=complete-v3-ecology-materials-20260612-bh3";
import { yAt, ecologyKind, roadMask, sealDecor } from "./VillagePolishGround.js?v=polish-ground-20260614-bh1";
const KEY = "__awtsmoosVillageEcologyRealityLayer";
const geos = new Map();
function geo(kind) { if (geos.has(kind)) return geos.get(kind); const g = kind === "cylinder" ? new THREE.CylinderGeometry(.5,.5,1,10) : kind === "sphere" ? new THREE.SphereGeometry(.5,10,8) : kind === "cone" ? new THREE.ConeGeometry(.5,1,10) : new THREE.BoxGeometry(1,1,1); geos.set(kind,g); return g; }
function seal(root) { root.traverse?.(c => Object.assign(c.userData ||= {}, { villageDecor:true, ecologyDecor:true, skipOctree:true, noOctree:true, skipRaycast:true })); return root; }
function mesh(kind, mat, x, y, z, s, r = 0, simple = false) { const m = new THREE.Mesh(geo(kind), ecologyMaterial(mat,{simple,repeat:2})); m.position.set(x,y+s[1]*.5,z); m.scale.set(s[0],s[1],s[2]); m.rotation.set(0,r,0); m.castShadow=false; m.receiveShadow=true; return seal(m); }
function veg(group,x,z,type){ group.add(mesh("cylinder",type,x,.02,z,[.11,.4,.11],0,false)); group.add(mesh("sphere","cabbageLeaf",x,.36,z,[.2,.1,.2],0,true)); }
function gardenBed(root,olam,x,z,rot=0){ const bed=new THREE.Group(); bed.position.set(x,yAt(olam,x,z)+.02,z); bed.rotation.y=rot; for(let i=-4;i<=4;i++) veg(bed,i*.3,Math.sin(i)*.08,i%3===0?"carrotSkin":i%3===1?"potatoSkin":"onionSkin"); bed.add(mesh("box","linenFabric",0,.01,.58,[3,.05,.12],0,true)); bed.add(mesh("box","linenFabric",0,.01,-.58,[3,.05,.12],0,true)); root.add(seal(bed)); }
function rockCluster(root,olam,x,z){ if(roadMask(x,z,4)>.45) return; const e=ecologyAt(x,z), base=yAt(olam,x,z)+.02, count=3+Math.floor(e.stone*5); for(let i=0;i<count;i++){ const a=i*2.399,r=.25+i*.18; root.add(mesh("sphere",i%2?"graniteRock":"slateStone",x+Math.cos(a)*r,base,z+Math.sin(a)*r,[.45+e.stone*.42,.25+e.stone*.22,.36],a)); if(e.moisture+e.shade>1.15) root.add(mesh("sphere","mossPatch",x+Math.cos(a)*(r+.18),base+.08,z+Math.sin(a)*(r+.18),[.2,.06,.18],a,true)); } }
function barkLog(root,olam,x,z,pine=false){ const y=yAt(olam,x,z)+.08,a=ecologyRand(x,z,8)*Math.PI; const m=mesh("cylinder",pine?"barkPine":"barkOak",x,y,z,[.18,1.35,.18],a); m.rotation.z=Math.PI/2; root.add(m); if(ecologyAt(x,z).moisture>.48) root.add(mesh("sphere","mushroomCap",x+.42,y+.05,z+.18,[.16,.13,.16],a,false)); }
function clothBundles(root,olam,x,z){ const y=yAt(olam,x,z)+.02; root.add(mesh("box","cottonFiber",x,y,z,[.72,.38,.48],.2,false)); root.add(mesh("box","linenFabric",x+.72,y,z+.18,[.66,.24,.42],-.15,false)); }
function mineralAccent(root,olam,x,z){ const y=yAt(olam,x,z)+.03; root.add(mesh("box","marbleWhite",x,y,z,[.45,.18,.45],.4,false)); if(ecologyRand(x,z,22)>.72) root.add(mesh("sphere","goldHammered",x+.28,y+.15,z+.15,[.12,.08,.12],0,false)); }
function flowerPatch(root,olam,x,z){ if(roadMask(x,z,3.8)>.4) return; const e=ecologyAt(x,z), base=yAt(olam,x,z)+.03, count=5+Math.floor(e.fertility*10); for(let i=0;i<count;i++){ const a=i*2.399,r=.12+i*.06; root.add(mesh("cylinder","cabbageLeaf",x+Math.cos(a)*r,base,z+Math.sin(a)*r,[.025,.28,.025],a,true)); root.add(mesh("sphere",i%2?"daisyPetal":"lavenderFlower",x+Math.cos(a)*r,base+.28,z+Math.sin(a)*r,[.1,.045,.1],a,true)); } }
function zone(root,olam,x,z){ const kind=ecologyKind(x,z), e=ecologyAt(x,z), jx=x+(ecologyRand(x,z,2)-.5)*10, jz=z+(ecologyRand(x,z,3)-.5)*10; if(kind==="village-square") return; if(kind==="sacred-grove"){ barkLog(root,olam,jx,jz,e.seed>.5); flowerPatch(root,olam,jx+1.2,jz-.8); return; } if(kind==="orchard"){ gardenBed(root,olam,jx,jz,e.seed*Math.PI); clothBundles(root,olam,jx+1.2,jz-.7); return; } if(kind==="trampled-road-edge"){ if(e.stone>.45) rockCluster(root,olam,jx,jz); return; } if(e.fertility>.62) flowerPatch(root,olam,jx,jz); if(e.stone>.66) rockCluster(root,olam,jx,jz); if(e.shade>.68&&e.moisture>.48) barkLog(root,olam,jx+1.2,jz-.8,e.seed>.5); if(e.traffic>.64) clothBundles(root,olam,jx-1.4,jz+.6); if(e.mineral>.78) mineralAccent(root,olam,jx+.9,jz-.4); }
function build(olam){ const root=new THREE.Group(); root.name="village_ecology_zone_aware_reality_layer"; Object.assign(root.userData,{ecologyStats:ecologyStats(),materialStats:ecologyMaterialStats()}); for(let x=-190;x<=190;x+=28) for(let z=-105;z<=105;z+=24) zone(root,olam,x,z); root.userData.counts={children:root.children.length,zoneAware:true}; return sealDecor(seal(root),{zoneAwareEcology:true}); }
export async function ensureVillageEcologyRealityLayer(context={}){ const olam=context.olam||context, scene=context.scene||olam.scene; if(!scene||!olam||olam[KEY]) return olam?.[KEY]||null; const root=build(olam); scene.add(root); olam[KEY]=root; return root; }
