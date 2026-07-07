// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import { groundTextures } from '../../geelooy/libs/awtsmoosCinematicWorld/assets/ChaiForestStaticAssets.js';
import { progressiveMaterialMap } from '../../geelooy/libs/awtsmoosCinematicWorld/materials/ProgressiveTextureLoader.js';
export default class TerrainMaterial {
  static weave(color = 0x7ec850, opts = {}) {
    const maps = groundTextures(true);
    const mat = new THREE.MeshLambertMaterial({ color });
    progressiveMaterialMap(THREE, mat, opts.textureUrl || maps.dirt, { repeat: { x: opts.repeatX || 18, y: opts.repeatY || 18 } });
    mat.userData.awtsmoosActualNamedTexture = opts.textureUrl || maps.dirt;
    mat.userData.loadsFastThenUpgrades = true;
    return mat;
  }
}
