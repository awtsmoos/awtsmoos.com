// B"H
/**
 * @file WorldDisposal.js
 * @description
 * Chapter 447: The old world returns its vessels to ayin.
 *
 * The Awtsmoos lets a worker survive while one world-form dissolves. This file
 * owns mesh/material/texture disposal so the router can remain a pure dispatcher.
 */
function disposeThreeObject(root) {
  root?.traverse?.(child => {
    child.geometry?.dispose?.();
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    mats.forEach(mat => {
      Object.values(mat || {}).forEach(value => value?.isTexture && value.dispose?.());
      mat?.dispose?.();
    });
  });
}

/**
 * Destroys the active world body while preserving the worker thread.
 *
 * @param {object} olam Active world.
 * @returns {void}
 */
export function destroyWorld(olam) {
  let disposed = 0;
  try {
    olam?.ayshPeula?.("destroy");
    olam?.nivrayim?.forEach?.(nivra => {
      disposeThreeObject(nivra?.mesh || nivra?.model || nivra?.object3D);
      nivra?.mixer?.stopAllAction?.();
      disposed += 1;
    });
    disposeThreeObject(olam?.scene);
    olam?.renderer?.renderLists?.dispose?.();
    olam?.worldOctree?.clear?.();
    if (Array.isArray(olam?.nivrayim)) olam.nivrayim.length = 0;
  } finally {
    self.postMessage({ destroyed: true, disposed });
  }
}
