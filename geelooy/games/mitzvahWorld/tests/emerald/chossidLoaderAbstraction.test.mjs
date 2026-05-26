#!/usr/bin/env node
/**
 * B"H
 * Verifies the Chossid NPC loader goes through renderer capabilities before
 * falling back to Three's GLTFLoader adapter.
 */
import { assert } from './assertions.js';
import { CHOSSID_GLB_PATH } from '../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/npcs/ChossidGlbPath.js';
import { loadFreshChossidGltf } from '../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/npcs/ChossidNpcLoader.js';

let requestedPath = null;
const fakeScene = {
  name: 'capability-scene',
  position: { set() {} },
  rotation: { set() {} },
  scale: { setScalar() {}, set() {} },
  userData: {},
  traverse() {}
};
const gltf = await loadFreshChossidGltf({
  rendererCapabilities: {
    loadModel: async path => {
      requestedPath = path;
      return fakeScene;
    }
  }
});

assert(requestedPath === CHOSSID_GLB_PATH, 'Chossid loader should use canonical GLB URL through renderer capabilities', { requestedPath, CHOSSID_GLB_PATH });
assert(gltf.scene === fakeScene, 'Capability-loaded model should be wrapped as a GLTF-like scene envelope', gltf);
console.log(JSON.stringify({ ok: true, requestedPath, sceneName: gltf.scene.name }, null, 2));
