// B"H
/**
 * @file goldenSky.js
 * @description
 * Chapter 28: The Awtsmoos hangs warmth behind the horizon.
 * This helper creates cheap sky glow planes and cloud wisps: not volumetric,
 * not WebGPU, only believable color layers for Lambert village scenes.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { finite } from "../math.js";
import { basicGlow } from "../lambert.js";
import { markDecorative } from "../decor.js";

function cloudTexture(size = 256) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  g.clearRect(0, 0, size, size);
  for (let i = 0; i < 42; i += 1) {
    const grad = g.createRadialGradient(Math.random() * size, Math.random() * size * 0.6, 1, Math.random() * size, Math.random() * size * 0.7, 18 + Math.random() * 48);
    grad.addColorStop(0, "rgba(255,226,174,.34)");
    grad.addColorStop(1, "rgba(255,226,174,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** @param {Object} op @returns {THREE.Group} */
export function createGoldenSkyLayers(op = {}) {
  const group = new THREE.Group();
  group.name = op.name || "AwtsmoosGoldenSky_layers";
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(finite(op.glowWidth, 100), finite(op.glowHeight, 42)), basicGlow(finite(op.glowColor, 0xffb66a), finite(op.glowOpacity, 0.26)));
  glow.position.set(finite(op.glowX, 8), finite(op.glowY, 18), finite(op.glowZ, -88));
  const clouds = new THREE.Mesh(new THREE.PlaneGeometry(finite(op.cloudWidth, 120), finite(op.cloudHeight, 34)), new THREE.MeshBasicMaterial({ map: cloudTexture(), transparent: true, opacity: finite(op.cloudOpacity, 0.72), depthWrite: false, side: THREE.DoubleSide }));
  clouds.position.set(finite(op.cloudX, 0), finite(op.cloudY, 28), finite(op.cloudZ, -92));
  group.add(glow, clouds);
  return markDecorative(group);
}
