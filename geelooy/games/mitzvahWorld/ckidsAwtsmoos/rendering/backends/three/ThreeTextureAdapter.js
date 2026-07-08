// B"H
/** @file ThreeTextureAdapter.js @description Texture intent materializes into Three texture only here. */
import * as THREE from "/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import FurGenerator from "../../../utils/TextureForge/Generators/Fur.js?compact=true&v=fur-generator-20260614-bh1";
const cache = new Map();
export function createThreeTexture(intent = {}) {
  const key = `${intent.kind || "fur"}:${intent.name || "rabbitfur"}:${intent.size || 384}`;
  if (cache.has(key)) return cache.get(key);
  let texture = null;
  if ((intent.kind || "fur") === "fur") texture = new THREE.CanvasTexture(FurGenerator.generate(intent.name || "rabbitfur", intent.size || 384, intent.size || 384));
  if (!texture) return null;
  texture.colorSpace = THREE.SRGBColorSpace; texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(intent.repeatX || 2.6, intent.repeatY || 1.4); texture.userData.awtsmoosTextureIntent = intent;
  cache.set(key, texture); return texture;
}
export default createThreeTexture;
