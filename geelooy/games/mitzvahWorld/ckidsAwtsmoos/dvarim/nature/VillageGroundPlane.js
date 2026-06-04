// B"H
/**
 * @file VillageGroundPlane.js
 * @description
 * Chapter 77: The ground passes the renderer into the shader snapshot forge.
 * The diffuse texture is baked once by WebGL, then the mesh remains Lambert.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import { finite } from "../../../../../libs/awtsmoos3d/math.js";
import { markDecorative } from "../../../../../libs/awtsmoos3d/decor.js";
import { villageGroundMaterial } from "../../../../../libs/awtsmoos3d/terrain/groundTexture.js?v=shader-ground-20260604-bh437";

export default class VillageGroundPlane extends Domem {
  type = "villageGroundPlane";
  constructor(op = {}, olam) {
    super({ ...op, isSolid: false, interactable: false }, olam);
    this.options = op;
    this.useAuthoredY = true;
  }

  async heescheel(olam) {
    const op = { ...this.options, renderer: olam?.renderer };
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(finite(op.width, 190), finite(op.depth, 190), 1, 1),
      villageGroundMaterial(op)
    );
    mesh.name = op.name || "VillageGroundPlane_shader_baked_lambert_earth";
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(finite(op.x), finite(op.y, -0.665), finite(op.z));
    this.mesh = markDecorative(mesh);
    await olam.hoyseef(this);
    this.isReady = true;
  }
}
