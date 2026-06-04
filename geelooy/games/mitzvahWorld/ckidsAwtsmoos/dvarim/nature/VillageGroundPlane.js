// B"H
/**
 * @file VillageGroundPlane.js
 * @description
 * Chapter 31: The earth receives one painted garment before the grasses rise.
 * A reusable canvas Lambert material from `geelooy/libs` turns the village floor
 * into warm grass, dirt, path wear, flecks, and shadow color without shaders.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import { finite } from "../../../../../libs/awtsmoos3d/math.js";
import { markDecorative } from "../../../../../libs/awtsmoos3d/decor.js";
import { villageGroundMaterial } from "../../../../../libs/awtsmoos3d/terrain/groundTexture.js";

export default class VillageGroundPlane extends Domem {
  type = "villageGroundPlane";
  constructor(op = {}, olam) {
    super({ ...op, isSolid: false, interactable: false }, olam);
    this.options = op;
    this.useAuthoredY = true;
  }

  async heescheel(olam) {
    const op = this.options;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(finite(op.width, 190), finite(op.depth, 190), 1, 1),
      villageGroundMaterial(op)
    );
    mesh.name = op.name || "VillageGroundPlane_painted_lambert_earth";
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(finite(op.x), finite(op.y, -0.68), finite(op.z));
    this.mesh = markDecorative(mesh);
    await olam.hoyseef(this);
    this.isReady = true;
  }
}
