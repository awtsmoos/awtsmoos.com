// B"H
/**
 * @file WorldRuntimeMetrics.js
 * The Awtsmoos makes a world from nothing every instant; this vessel counts only
 * what the renderer and scene truly reveal, so beauty never outruns evidence.
 */
function asArray(v) { return Array.isArray(v) ? v : v ? [v] : []; }
function findWorld(scope = globalThis) {
  return scope.__AWTSMOOS_OLAM__ || scope.olam || scope.ikar?.olam || scope.mana?.activeOlam || scope.mana?.olam || null;
}
function findRenderer(scope = globalThis) {
  return scope.__AWTSMOOS_RENDERER__ || scope.renderer || scope.mana?.renderer || scope.ikar?.renderer || null;
}
function materialKey(m) { return m?.uuid || m?.name || m?.type || "material"; }
function triangleCount(geometry) {
  if (!geometry) return 0;
  if (geometry.index?.count) return Math.floor(geometry.index.count / 3);
  if (geometry.attributes?.position?.count) return Math.floor(geometry.attributes.position.count / 3);
  return 0;
}
export function collectWorldRuntimeMetrics(scope = globalThis) {
  const world = findWorld(scope);
  const renderer = findRenderer(scope);
  const root = world?.scene || scope.scene || null;
  const materials = new Set();
  const scene = { meshes:0, visibleMeshes:0, instancedMeshes:0, skinnedMeshes:0, materials:0, triangles:0, npcMeshes:0, animalMeshes:0, terrainChunks:0 };
  root?.traverse?.(object => {
    if (!object?.isMesh) return;
    scene.meshes += 1;
    if (object.visible !== false) scene.visibleMeshes += 1;
    if (object.isInstancedMesh) scene.instancedMeshes += 1;
    if (object.isSkinnedMesh) scene.skinnedMeshes += 1;
    scene.triangles += triangleCount(object.geometry);
    asArray(object.material).forEach(m => materials.add(materialKey(m)));
    const data = object.userData || {};
    const name = String(object.name || "");
    if (data.npcId || /npc|chossid|villager/i.test(name)) scene.npcMeshes += 1;
    if (data.animalId || data.species || /animal|wildlife|fox|goat|deer|sheep|rabbit|bird/i.test(name)) scene.animalMeshes += 1;
    if (data.chunkKey || /terrain|chunk/i.test(name)) scene.terrainChunks += 1;
  });
  scene.materials = materials.size;
  const memory = performance?.memory ? {
    usedJSHeapSize: performance.memory.usedJSHeapSize,
    totalJSHeapSize: performance.memory.totalJSHeapSize,
    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
  } : null;
  return {
    at: Date.now(),
    url: scope.location?.href || "",
    renderer: renderer?.info ? { render:{...renderer.info.render}, memory:{...renderer.info.memory}, programs: renderer.info.programs?.length || 0 } : null,
    scene,
    entities: {
      npcs: world?.npcs?.length || world?.nivrayim?.filter?.(x => x?.npcId || /npc/i.test(x?.name || ""))?.length || 0,
      animals: world?.animals?.length || world?.wildlife?.length || 0,
      missions: world?.missions?.length || Object.keys(world?.questState || {}).length || 0,
      terrainChunks: world?.terrainChunks?.size || scene.terrainChunks
    },
    memory
  };
}
export default collectWorldRuntimeMetrics;
