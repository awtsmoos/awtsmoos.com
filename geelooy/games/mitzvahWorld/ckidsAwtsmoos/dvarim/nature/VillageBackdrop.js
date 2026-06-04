// B"H
/**
 * @file VillageBackdrop.js
 * @description
 * Chapter 16: The Awtsmoos paints distance without expensive shaders.
 * Layered Lambert/basic hills and haze planes create the screenshot's depth:
 * warm horizon, far mountains, and soft sky glow, all WebGL-safe.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import { finite as n } from "../../../../../libs/awtsmoos3d/math.js";
import { markDecorative } from "../../../../../libs/awtsmoos3d/decor.js";
import { basicGlow } from "../../../../../libs/awtsmoos3d/lambert.js";

function hillShape(width, height, color) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.quadraticCurveTo(-width * 0.25, height * 0.85, 0, height * 0.58);
  shape.quadraticCurveTo(width * 0.28, height * 1.1, width / 2, 0);
  shape.lineTo(width / 2, -height * 0.12);
  shape.lineTo(-width / 2, -height * 0.12);
  const geo = new THREE.ShapeGeometry(shape);
  return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.46, depthWrite: false, side: THREE.DoubleSide }));
}

function place(mesh, x, y, z, scale) {
  mesh.position.set(x, y, z);
  mesh.scale.setScalar(scale);
  return mesh;
}

export default class VillageBackdrop extends Domem {
  type = "villageBackdrop";
  constructor(op = {}, olam) { super({ ...op, isSolid: false, interactable: false }, olam); this.options = op; this.useAuthoredY = true; }

  async heescheel(olam) {
    const op = this.options;
    const group = new THREE.Group();
    group.name = this.name || "VillageBackdrop_hills_haze_gold";
    group.add(place(hillShape(72, 12, n(op.backColor, 0x8aa06b)), -24, 11, -96, 1));
    group.add(place(hillShape(92, 16, n(op.midColor, 0x78915d)), 28, 8, -88, 1));
    group.add(place(hillShape(118, 22, n(op.nearColor, 0x657a50)), 0, 4.4, -82, 1));
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(90, 34), basicGlow(n(op.glowColor, 0xffb66a), n(op.glowOpacity, 0.28)));
    glow.position.set(n(op.glowX, 8), n(op.glowY, 16), n(op.glowZ, -84));
    group.add(glow);
    this.mesh = group;
    markDecorative(this.mesh);
    await olam.hoyseef(this);
    this.isReady = true;
  }
}
