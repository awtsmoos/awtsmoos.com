// B"H
/**
 * WorldRuntimeMetrics: observes without tearing the veil.
 * No scene traversal during gameplay; cached summaries and renderer.info only.
 */
function findWorld(scope=globalThis){return scope.__AWTSMOOS_OLAM__||scope.olam||scope.ikar?.olam||scope.mana?.activeOlam||scope.mana?.olam||null;}
function findRenderer(scope=globalThis){return scope.__AWTSMOOS_RENDERER__||scope.renderer||scope.mana?.renderer||scope.ikar?.renderer||findWorld(scope)?.renderer||null;}
function countArray(v){return Array.isArray(v)?v.length:0;}
function sizeOf(v){return typeof v?.size==='number'?v.size:0;}
function cachedScene(scope,world){const s=scope.__MITZVAH_WORLD_RUNTIME_SCENE_CACHE__||world?.userData?.runtimeSceneStats||world?.scene?.userData?.stats||{};return{meshes:Number(s.meshes||0),visibleMeshes:Number(s.visibleMeshes||0),instancedMeshes:Number(s.instancedMeshes||0),skinnedMeshes:Number(s.skinnedMeshes||0),materials:Number(s.materials||0),triangles:Number(s.triangles||0),npcMeshes:Number(s.npcMeshes||0),animalMeshes:Number(s.animalMeshes||0),terrainChunks:Number(s.terrainChunks||0),cached:true};}
function entitiesOf(world,scene){const niv=countArray(world?.nivrayim);return{npcs:countArray(world?.npcs)||world?.npcCount||0,animals:countArray(world?.animals)||countArray(world?.wildlife)||world?.animalCount||0,missions:countArray(world?.missions)||Object.keys(world?.questState||{}).length,terrainChunks:sizeOf(world?.terrainChunks)||scene.terrainChunks||0,nivrayim:niv};}
function memoryOf(){return performance?.memory?{usedJSHeapSize:performance.memory.usedJSHeapSize,totalJSHeapSize:performance.memory.totalJSHeapSize,jsHeapSizeLimit:performance.memory.jsHeapSizeLimit}:null;}
export function collectWorldRuntimeMetrics(scope=globalThis){const world=findWorld(scope),renderer=findRenderer(scope),scene=cachedScene(scope,world);return{at:Date.now(),url:scope.location?.href||'',renderer:renderer?.info?{render:{...renderer.info.render},memory:{...renderer.info.memory},programs:renderer.info.programs?.length||0}:null,scene,entities:entitiesOf(world,scene),memory:memoryOf(),cheap:true,seal:'no-traverse-runtime-metrics-20260623-bh5'};}
export default collectWorldRuntimeMetrics;