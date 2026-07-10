// B"H
import { loadTinyGltf } from '../../../light-three-gltf/tiny-gltf-loader.js';

/** ModelAssetLoader: every GLB receives its own URL vessel and no shared scene. */
export async function loadIsolatedGltf(url, label) {
  const isolatedUrl = withIsolation(url, label);
  const gltf = await loadTinyGltf(isolatedUrl);
  gltf.scene.name = `${label}_isolated_gltf_scene`;
  gltf.scene.userData.isolatedModelLoad = { label, originalUrl: url, isolatedUrl };
  return gltf;
}
function withIsolation(url, label) {
  const u = new URL(url, location.href);
  u.searchParams.set('AwtsmoosIsolatedGlb', label);
  u.searchParams.set('v', Date.now().toString(36));
  return u.href;
}
