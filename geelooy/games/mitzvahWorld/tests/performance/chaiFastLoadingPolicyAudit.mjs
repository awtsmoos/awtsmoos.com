// B"H
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = path => readFileSync(path, "utf8");
const store = read("geelooy/libs/awtsmoosCinematicWorld/store/ChaiAssetStore.js"), index = read("index.html"), loader = read("geelooy/libs/awtsmoosCinematicWorld/materials/ProgressiveTextureLoader.js"), forest = read("../../libs/awtsmoos3d/foliage/forestField.js"), hero = read("../../libs/awtsmoos3d/tree/heroTree.js"), grass = read("../../libs/awtsmoos3d/foliage/grassField.js"), ground = read("../../libs/awtsmoos3d/terrain/groundTexture.js");
assert(store.includes("autoPreloadDeferred:true") && store.includes("play-first-then-upgrade-textures"), "Chai preload must be deferred/play-first");
assert(index.includes("ChaiAssetStore.js"), "index must install Chai store metadata");
for (const source of [loader, forest, hero, grass, ground]) assert(!source.includes("loadAsync"), "gameplay visuals must not block on loadAsync");
for (const forbidden of ["TextureLoader", "ImageLoader", "document.createElement", "createElementNS"]) assert(!loader.includes(forbidden), `loader still blocks worker safety: ${forbidden}`);
assert(loader.includes("createImageBitmap") && loader.includes("OffscreenCanvas"), "texture loading must use custom bitmap/offscreen path");
assert(forest.includes("DEFAULT_MAX_PROCEDURAL_TREES = 2"), "procedural forest must cap density for FPS");
assert(forest.includes("InstancedMesh") && forest.includes("triangleBudgetedFor60fps"), "forest must instance and triangle-budget procedural-core geometry");
assert(hero.includes("createProceduralCoreTree") && hero.includes("progressiveMaterialMap"), "hero tree must use procedural-core geometry and progressive maps");
assert(grass.includes("InstancedMesh"), "grass must stay instanced for FPS");
assert(ground.includes("noFlatGreenFallback"), "ground must reject flat fallback contract");
console.log(JSON.stringify({ ok:true, test:"chaiFastLoadingPolicyAudit", bitmapLoader:true, proceduralCoreTreeCap:2, instancedProceduralCorePrototype:true, triangleBudgetedFor60fps:true, minimalForestBudget:true }, null, 2));
