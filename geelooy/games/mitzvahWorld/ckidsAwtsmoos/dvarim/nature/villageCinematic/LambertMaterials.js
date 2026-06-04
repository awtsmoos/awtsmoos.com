// B"H
/**
 * @file LambertMaterials.js
 * @description
 * Chapter 7: The Awtsmoos paints realism with humble Lambert clay.
 * WebGL does not need heavy magic to feel alive. These reusable material
 * vessels use only Lambert/Basic, canvas diffuse maps, and alpha-tested leaves.
 */
import * as THREE from "/games/scripts/build/three.module.js";

function canvas(size = 128) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return [c, c.getContext("2d")];
}

function textureFrom(draw, size = 128) {
  const [c, ctx] = canvas(size);
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

/** @returns {THREE.MeshLambertMaterial} Warm bark with painted vertical noise. */
export function barkMaterial(color = 0x5a351d) {
  const map = textureFrom((g, s) => {
    g.fillStyle = "#5b351f"; g.fillRect(0, 0, s, s);
    for (let x = 0; x < s; x += 4) {
      g.fillStyle = x % 12 ? "rgba(40,22,10,.32)" : "rgba(220,160,95,.18)";
      g.fillRect(x, 0, 2, s);
    }
  });
  map.repeat.set(1, 3);
  return new THREE.MeshLambertMaterial({ color, map });
}

/** @returns {THREE.MeshLambertMaterial} Soft stone/plaster material. */
export function stoneMaterial(color = 0xb8a886) {
  const map = textureFrom((g, s) => {
    g.fillStyle = "#b8aa89"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 420; i += 1) {
      const v = 120 + Math.random() * 90;
      g.fillStyle = `rgba(${v},${v * .95},${v * .78},.16)`;
      g.fillRect(Math.random() * s, Math.random() * s, 1 + Math.random() * 3, 1 + Math.random() * 3);
    }
  });
  map.repeat.set(2, 2);
  return new THREE.MeshLambertMaterial({ color, map });
}

/** @returns {THREE.MeshLambertMaterial} Dirt-brown path material. */
export function dirtMaterial(color = 0x8b6a3f) {
  const map = textureFrom((g, s) => {
    g.fillStyle = "#8a673f"; g.fillRect(0, 0, s, s);
    for (let i = 0; i < 300; i += 1) {
      g.fillStyle = i % 2 ? "rgba(60,35,16,.16)" : "rgba(230,190,120,.13)";
      g.beginPath(); g.arc(Math.random() * s, Math.random() * s, Math.random() * 2.2, 0, Math.PI * 2); g.fill();
    }
  });
  map.repeat.set(3, 3);
  return new THREE.MeshLambertMaterial({ color, map });
}

/** @returns {THREE.MeshLambertMaterial} Alpha-tested leaf card material. */
export function leafCardMaterial(color = 0x4f9f36) {
  const map = textureFrom((g, s) => {
    g.clearRect(0, 0, s, s);
    g.fillStyle = "rgba(70,150,45,1)";
    g.beginPath(); g.ellipse(s / 2, s / 2, s * .38, s * .46, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(210,245,150,.55)"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(s / 2, s * .14); g.lineTo(s / 2, s * .86); g.stroke();
  });
  return new THREE.MeshLambertMaterial({ color, map, side: THREE.DoubleSide, alphaTest: 0.42 });
}
