// B"H
/** @file VillageGroundPlane.js @description Large textured ground, no abrupt tiny grass edge. */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import { finite } from "../../../../../libs/awtsmoos3d/math.js";
import { markDecorative } from "../../../../../libs/awtsmoos3d/decor.js";
import { villageGroundMaterial } from "../../../../../libs/awtsmoos3d/terrain/groundTexture.js?v=wide-ground-texture-20260614-bh1";
export default class VillageGroundPlane extends Domem{
  type="villageGroundPlane";
  constructor(op={},olam){super({...op,isSolid:false,interactable:false},olam);this.options=op;this.useAuthoredY=true;}
  async heescheel(olam){const op={...this.options,renderer:olam?.renderer}; const width=Math.max(finite(op.width,2600),2600), depth=Math.max(finite(op.depth,2600),2600); const mat=villageGroundMaterial({...op,width,depth,repeatX:width/80,repeatY:depth/80,size:1024}); const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,depth,1,1),mat); mesh.name=op.name||"VillageGroundPlane_wide_textured_grainy_earth"; mesh.rotation.x=-Math.PI/2; mesh.position.set(finite(op.x),finite(op.y,-.665),finite(op.z)); mesh.userData.wideGroundTexture=true; mesh.userData.noSolidColor=true; this.mesh=markDecorative(mesh); await olam.hoyseef(this); this.isReady=true;}
}
