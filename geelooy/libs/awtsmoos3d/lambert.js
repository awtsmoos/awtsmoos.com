// B"H
/**
 * @file lambert.js
 * @description
 * Chapter 14: The Awtsmoos makes realism from canvas and Lambert humility.
 * These helpers create reusable diffuse textures for WebGL-safe scenes: bark,
 * stone, dirt, plaster, roof, and alpha-tested leaves.
 */
import * as THREE from "/games/scripts/build/three.module.js";

function makeTexture(draw, size = 128, repeat = 1) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  draw(g, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.needsUpdate = true;
  return tex;
}

function speckles(g, size, dark, light, count = 300) {
  for (let i = 0; i < count; i += 1) {
    g.fillStyle = i % 2 ? dark : light;
    g.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 3, 1 + Math.random() * 3);
  }
}

/** @returns {THREE.MeshLambertMaterial} */
export function lambertBark(color = 0x5a351d) {
  const map = makeTexture((g, s) => { g.fillStyle = "#5a351d"; g.fillRect(0, 0, s, s); speckles(g, s, "rgba(35,18,8,.3)", "rgba(220,155,80,.16)", 260); }, 128, 1.2);
  return new THREE.MeshLambertMaterial({ color, map });
}

/** @returns {THREE.MeshLambertMaterial} */
export function lambertNoise(color = 0xb8a886, base = "#b8aa89") {
  const map = makeTexture((g, s) => { g.fillStyle = base; g.fillRect(0, 0, s, s); speckles(g, s, "rgba(70,60,45,.18)", "rgba(255,240,190,.16)", 420); }, 128, 2);
  return new THREE.MeshLambertMaterial({ color, map });
}

/** @returns {THREE.MeshLambertMaterial} */
export function lambertLeaf(color = 0x4f9f36) {
  const map = makeTexture((g, s) => { g.clearRect(0, 0, s, s); g.fillStyle = "#579f36"; g.beginPath(); g.ellipse(s / 2, s / 2, s * .38, s * .46, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = "rgba(230,255,170,.55)"; g.beginPath(); g.moveTo(s / 2, s * .12); g.lineTo(s / 2, s * .88); g.stroke(); }, 64, 1);
  return new THREE.MeshLambertMaterial({ color, map, side: THREE.DoubleSide, alphaTest: 0.42 });
}

/** @returns {THREE.MeshBasicMaterial} */
export function basicGlow(color = 0xffc46b, opacity = 0.42) {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide });
}
