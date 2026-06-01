// B"H
/**
 * @file destroy.js
 * @description
 * Chapter 2: The Destroy Gate stopped biting shadows. The Awtsmoos reveals
 * cleanup as mercy: every mesh, texture, list, and renderer is asked whether it
 * can dissolve before the blade descends. No undefined phantom may crash the
 * Olam while the next world is being born from silence.
 */

/**
 * Safely calls a disposer-like function if it exists.
 *
 * @param {*} vessel The object that may carry a dispose method.
 * @returns {void}
 */
function safelyDispose(vessel) {
  try {
    if (vessel && typeof vessel.dispose === "function") vessel.dispose();
  } catch (error) {
    console.warn("B'H | DESTROY_TRACE | dispose skipped", error);
  }
}

/**
 * Dissolves all texture maps that may cling to a material.
 *
 * @param {*} material The possible THREE material vessel.
 * @returns {void}
 */
function disposeMaterial(material) {
  if (!material) return;
  ["map", "lightMap", "bumpMap", "normalMap", "specularMap", "envMap"]
    .forEach(key => safelyDispose(material[key]));
  safelyDispose(material);
}

/**
 * Dissolves geometry and material vessels on one scene node.
 *
 * @param {*} node A possible THREE object.
 * @returns {void}
 */
function disposeNode(node) {
  safelyDispose(node?.geometry);
  const material = node?.material;
  if (Array.isArray(material)) material.forEach(disposeMaterial);
  else disposeMaterial(material);
}

/**
 * Walks a hierarchy without assuming children exist.
 *
 * @param {*} node Root node.
 * @param {(node: *) => void} action Per-node action.
 * @returns {void}
 */
function walkHierarchy(node, action) {
  if (!node) return;
  for (const child of [...(node.children || [])]) walkHierarchy(child, action);
  action(node);
}

/**
 * Clears the scene and renderer without throwing during teardown.
 *
 * @param {*} scene THREE scene.
 * @param {*} renderer THREE renderer.
 * @returns {void}
 */
function clearScene(scene, renderer) {
  walkHierarchy(scene, disposeNode);
  try { scene?.clear?.(); } catch {}
  safelyDispose(renderer?.renderAsyncLists);
  safelyDispose(renderer);
}

/**
 * Registers the Olam destroy event.
 *
 * @returns {void}
 */
export default function registerDestroyGate() {
  this.on("destroy", async () => {
    for (const nivra of [...(this.nivrayim || [])]) await this.sealayk?.(nivra);
    this.components = {};
    this.vars = {};
    this.ayshPeula?.("htmlDelete", { shaym: "ikarGameMenu" });
    clearScene(this.scene, this.renderer);
    this.clearAll?.();
    this.nivrayim = [];
    this.nivrayimWithPlaceholders = [];
    delete this.renderer;
    delete this.scene;
    delete this.worldOctree;
    delete this.interactiveOctree;
    this.destroyed = true;
  });
}
