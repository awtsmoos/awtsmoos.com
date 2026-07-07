// B"H
import * as THREE from "/games/scripts/build/three.module.js";
const HALF = "https://awtsmoos-docs-base.web.app/half-resolution";
const cache = new Map();
function staticTexture(name) { const u = `${HALF}/${encodeURIComponent(name)}.png`; if (cache.has(u)) return cache.get(u); const loader = new THREE.TextureLoader(); loader.setCrossOrigin?.("anonymous"); const t = loader.load(u); if (THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; cache.set(u, t); return t; }
export function createVillageGroundTexture(op = {}) { const t = staticTexture(op.textureName || "dirt grass 2"); t.repeat?.set?.(op.repeatX || Math.max(4, (op.width || 400) / 40), op.repeatY || Math.max(4, (op.depth || 400) / 40)); t.userData.actualHostedTexture = true; return t; }
