// B"H
/** @module buildHut @description Grainy textured grounded cottages with beams, door, windows, and honest walls. */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { makeWall } from "./wallUtils.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { materialWithTexture } from "../materials/ProceduralTextureKit.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
function deco(group, name, mat, pos, scale){const m=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),mat);m.name=name;m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;m.userData={hutDecor:true,skipOctree:true,noOctree:true};group.add(m);return m;}
function roof(group, w, d, h){const mat=materialWithTexture("wood",{size:384});const shape=new THREE.Shape();shape.moveTo(-w*.62,0);shape.lineTo(0,h*.64);shape.lineTo(w*.62,0);shape.lineTo(-w*.62,0);const geo=new THREE.ExtrudeGeometry(shape,{depth:d*1.22,bevelEnabled:false});geo.translate(0,0,-d*.61);const mesh=new THREE.Mesh(geo,mat);mesh.name="grainy_wooden_gable_roof";mesh.position.y=h;mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData={isSolid:true,hutRoof:true};group.add(mesh);return mesh;}
export async function buildHut(scene, physics, def, olam = null) {
  const p=def.props||{}, width=p.width||6, depth=p.depth||6, wallHeight=p.wallHeight||3;
  const [px,py,pz]=def.position||[0,0,0], t=.3, hw=width/2, hd=depth/2, mh=wallHeight/2;
  const wallMat=materialWithTexture("brick",{size:384}), wood=materialWithTexture("wood",{size:384}), glass=materialWithTexture("glass",{size:192});
  const group=new THREE.Group(); group.position.set(px,py,pz); group.name=def.id||"awtsmoos_grainy_hut";
  makeWall(group,wallMat,0,mh,-hd,width,wallHeight,t,olam); makeWall(group,wallMat,hw,mh,0,t,wallHeight,depth,olam); makeWall(group,wallMat,-hw,mh,0,t,wallHeight,depth,olam);
  const doorW=1.35, sideW=(width-doorW)/2; makeWall(group,wallMat,-(hw-sideW/2),mh,hd,sideW,wallHeight,t,olam); makeWall(group,wallMat,(hw-sideW/2),mh,hd,sideW,wallHeight,t,olam);
  roof(group,width,depth,wallHeight); deco(group,"dark_wood_door",wood,[0,1,hd+.18],[doorW*.72,2,.16]);
  for(const s of[-1,1]){deco(group,`window_${s}`,glass,[s*hw*.52,1.85,hd+.19],[.72,.62,.08]);deco(group,`beam_front_${s}`,wood,[s*hw*.72,wallHeight*.52,hd+.22],[.16,wallHeight,.18]);}
  deco(group,"ridge_beam",wood,[0,wallHeight*1.67,0],[.2,.18,depth*1.28]);
  return [group];
}
