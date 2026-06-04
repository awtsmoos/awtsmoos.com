// B"H
/**
 * @file VillageLightingRig.js
 * @description
 * Chapter 17: The Awtsmoos lowers the sun until Lambert becomes cinematic.
 * A warm directional key, a soft hemisphere fill, and optional fog tuning make
 * the village read like golden hour without WebGPU or heavy postprocessing.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import { finite as n } from "../../../../../libs/awtsmoos3d/math.js";

export default class VillageLightingRig extends Domem {
  type = "villageLightingRig";
  constructor(op = {}, olam) { super({ ...op, isSolid: false, interactable: false }, olam); this.options = op; this.useAuthoredY = true; }

  async heescheel(olam) {
    const op = this.options;
    const group = new THREE.Group();
    group.name = this.name || "VillageLightingRig_golden_hour_lambert";
    const hemi = new THREE.HemisphereLight(n(op.skyColor, 0xffd9a4), n(op.groundColor, 0x31512f), n(op.hemiIntensity, 0.72));
    const sun = new THREE.DirectionalLight(n(op.sunColor, 0xffc27a), n(op.sunIntensity, 1.18));
    sun.position.set(n(op.sunX, -24), n(op.sunY, 28), n(op.sunZ, 18));
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -52, right: 52, top: 52, bottom: -52, near: 1, far: 110 });
    group.add(hemi, sun);
    if (olam?.scene) {
      olam.scene.fog = new THREE.Fog(n(op.fogColor, 0xffc88a), n(op.fogNear, 75), n(op.fogFar, 420));
      olam.scene.add(group);
    } else await olam.hoyseef(this);
    this.mesh = group;
    this.isReady = true;
  }
}
