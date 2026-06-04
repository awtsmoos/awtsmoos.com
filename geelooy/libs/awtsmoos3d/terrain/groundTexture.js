// B"H
/**
 * @file groundTexture.js
 * @description
 * Chapter 26: The Awtsmoos paints earth before geometry multiplies.
 * A single canvas diffuse map carries grass, dirt, flower flecks, shadow stains,
 * and path wear. It is cheap WebGL, but the eye receives authored abundance.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { hash } from "../math.js";

function strokeBlob(g, x, y, r, color) {
  g.fillStyle = color;
  g.beginPath();
  g.ellipse(x, y, r * (0.7 + Math.random() * 0.8), r * (0.5 + Math.random()), Math.random() * Math.PI, 0, Math.PI * 2);
  g.fill();
}

function grass(g, size) {
  g.fillStyle = "#486b2f";
  g.fillRect(0, 0, size, size);
  for (let i = 0; i < 2200; i += 1) {
    const h = i % 3 === 0 ? "rgba(180,200,88,.12)" : "rgba(24,56,20,.18)";
    strokeBlob(g, hash(i, 1) * size, hash(i, 2) * size, 1 + hash(i, 3) * 3.2, h);
  }
}

function dirtPath(g, size, points) {
  g.lineCap = "round";
  g.lineJoin = "round";
  g.strokeStyle = "rgba(124,86,48,.76)";
  g.lineWidth = size * 0.085;
  g.beginPath();
  points.forEach(([x, y], i) => i ? g.lineTo(x * size, y * size) : g.moveTo(x * size, y * size));
  g.stroke();
  g.strokeStyle = "rgba(205,176,108,.18)";
  g.lineWidth = size * 0.045;
  g.stroke();
}

function flowers(g, size) {
  for (let i = 0; i < 520; i += 1) {
    const c = i % 5 ? "rgba(238,220,92,.55)" : "rgba(240,240,220,.55)";
    strokeBlob(g, hash(i, 11) * size, hash(i, 12) * size, 0.8 + hash(i, 13) * 1.4, c);
  }
}

/**
 * Create a reusable warm village ground texture.
 * @param {Object} op Authored texture controls.
 * @returns {THREE.CanvasTexture} Repeatable diffuse map.
 */
export function createVillageGroundTexture(op = {}) {
  const size = op.size || 1024;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  grass(g, size);
  dirtPath(g, size, op.pathUv || [[0.15, 0.8], [0.35, 0.58], [0.5, 0.48], [0.7, 0.36], [0.9, 0.2]]);
  flowers(g, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(op.repeatX || 1, op.repeatY || 1);
  tex.needsUpdate = true;
  return tex;
}

/** @param {Object} op @returns {THREE.MeshLambertMaterial} */
export function villageGroundMaterial(op = {}) {
  return new THREE.MeshLambertMaterial({ color: op.color || 0x6f8f3a, map: createVillageGroundTexture(op) });
}
