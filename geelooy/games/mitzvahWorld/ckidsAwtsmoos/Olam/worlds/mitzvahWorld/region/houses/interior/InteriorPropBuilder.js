// B"H
/** @file InteriorPropBuilder.js @description Builds named furniture/tool meshes from semantic prop specs. */
import * as THREE from "/games/scripts/build/three.module.js";
import { propSpec } from "./InteriorPropPalette.js";
function mat(color){ return new THREE.MeshLambertMaterial({ color, transparent:false, opacity:1, depthWrite:true, depthTest:true }); }
export function buildInteriorProp(house={}, item={}, sockets={}){ const kind=item.kind||"chest", spec=propSpec(kind), socket=sockets[item.socket||spec.socket]||{x:0,y:.2,z:0}; const mesh=new THREE.Mesh(new THREE.BoxGeometry(...spec.size), mat(spec.color)); mesh.name=`${house.id}_interior_${kind}`; mesh.position.set(item.x??socket.x, item.y??socket.y, item.z??socket.z); Object.assign(mesh.userData||={}, { cottageInterior:true, interiorProp:kind, socket:item.socket||spec.socket, skipOctree:true, noOctree:true, opacitySealed:true }); return mesh; }
export default buildInteriorProp;
