// B"H
import * as THREE from "/games/scripts/build/three.module.js";
const HALF = "https://awtsmoos-docs-base.web.app/half-resolution";
const texCache = new Map();
const url = name => `${HALF}/${encodeURIComponent(name)}.png`;
function load(urlIn, repeat = [1, 1]) { if (texCache.has(urlIn)) return texCache.get(urlIn); const loader = new THREE.TextureLoader(); loader.setCrossOrigin?.("anonymous"); const t = loader.load(urlIn); if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); t.anisotropy = 4; texCache.set(urlIn, t); return t; }
export function lambertBark(color = 0x5a351d) { return new THREE.MeshLambertMaterial({ color, map: load(url("tree bark 1"), [2, 4]) }); }
export function lambertNoise(color = 0xb8a886, base = 0xb8aa89) { return new THREE.MeshLambertMaterial({ color, map: load(url("stone 1"), [3, 3]) }); }
export function lambertLeaf(color = 0x5fa83a) { return new THREE.MeshLambertMaterial({ color, map: load(url("leaf 1")), side: THREE.DoubleSide, alphaTest: 0.18, transparent: true }); }
export function basicGlow(color = 0xffc46b, opacity = 0.42) { return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide }); }
export const FUR_GANG = Object.freeze({ horse: url("horse fur 1"), cow: url("cow fur 1"), deer: url("deer fur 1"), fox: url("fox fur 1") });
