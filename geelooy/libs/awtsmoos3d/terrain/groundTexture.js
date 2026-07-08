// B"H
/** Chai Forest ground: visible immediately, half-res first, never flat green. */
import * as THREE from "/games/scripts/build/three.module.js";
import { ACTUAL_TEXTURES, groundTextures, namedTexture } from "/games/mitzvahWorld/geelooy/libs/awtsmoosCinematicWorld/assets/ChaiForestStaticAssets.js";
import { loadProgressiveTexture } from "/games/mitzvahWorld/geelooy/libs/awtsmoosCinematicWorld/materials/ProgressiveTextureLoader.js";

function repeatFor(op = {}) {
  const width = Number(op.width || 420), depth = Number(op.depth || 420);
  return { x:op.repeatX || Math.max(8, width / 42), y:op.repeatY || Math.max(8, depth / 42) };
}

export function createVillageGroundTexture(op = {}) {
  const repeat = repeatFor(op);
  const textureName = op.textureName || ACTUAL_TEXTURES.dirtGrass2;
  const texture = loadProgressiveTexture(THREE, namedTexture(textureName, true), {
    repeat,
    fallback:[86, 128, 58, 255]
  });
  Object.assign(texture.userData, {
    actualHostedTexture:true,
    chaiForestGround:true,
    textureName,
    halfResolutionFirst:true
  });
  return texture;
}

export function villageGroundMaterial(op = {}) {
  const repeat = repeatFor(op);
  const urls = groundTextures(true);
  const grass = createVillageGroundTexture({ ...op, textureName:ACTUAL_TEXTURES.grass });
  const dirt = loadProgressiveTexture(THREE, urls.dirt, { repeat, fallback:[103, 82, 49, 255] });
  const normal = loadProgressiveTexture(THREE, urls.importedDirtNormal, { srgb:false, repeat, fallback:[128, 128, 255, 255] });
  const mat = new THREE.MeshLambertMaterial({ color:0xffffff, map:grass, side:THREE.DoubleSide });
  mat.normalMap = normal;
  Object.assign(mat.userData, {
    actualHostedTexture:true,
    chaiForestGroundTextures:urls,
    progressiveChaiGround:true,
    grassTextureName:ACTUAL_TEXTURES.grass,
    dirtTextureName:ACTUAL_TEXTURES.dirtGrass2,
    noFlatGreenFallback:true,
    loadsFastThenUpgrades:true,
    secondaryDirtMap:dirt
  });
  return mat;
}
