// B"H
/**
 * @file goldenSky.js
 * @description
 * Chapter 73: The clouds are shader-born and then still.
 * A custom cloud shader renders once into a texture snapshot; the scene carries
 * only a simple Basic material afterward, with no per-frame cloud computation.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { finite } from "../math.js";
import { basicGlow } from "../lambert.js?v=shader-lambert-20260604-bh437";
import { markDecorative } from "../decor.js";
import { bakeShaderTexture } from "../shaderTexture.js?v=shader-snapshot-20260604-bh437";

function cloudTexture(renderer) {
  return bakeShaderTexture(renderer, { kind: "cloud", size: 256, colorA: 0xffe2ae, colorB: 0xffffff, colorC: 0xffb66a });
}

/** @param {Object} op @param {Object} ctx @returns {THREE.Group} */
export function createGoldenSkyLayers(op = {}, ctx = {}) {
  const group = new THREE.Group();
  const renderer = ctx.renderer || ctx.olam?.renderer || op.renderer;
  group.name = op.name || "AwtsmoosGoldenSky_layers";
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(finite(op.glowWidth, 100), finite(op.glowHeight, 42)), basicGlow(finite(op.glowColor, 0xffb66a), finite(op.glowOpacity, 0.26)));
  glow.position.set(finite(op.glowX, 8), finite(op.glowY, 18), finite(op.glowZ, -88));
  const clouds = new THREE.Mesh(new THREE.PlaneGeometry(finite(op.cloudWidth, 120), finite(op.cloudHeight, 34)), new THREE.MeshBasicMaterial({ map: cloudTexture(renderer), transparent: true, opacity: finite(op.cloudOpacity, 0.72), depthWrite: false, side: THREE.DoubleSide }));
  clouds.position.set(finite(op.cloudX, 0), finite(op.cloudY, 28), finite(op.cloudZ, -92));
  group.add(glow, clouds);
  return markDecorative(group);
}
