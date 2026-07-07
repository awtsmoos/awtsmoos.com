// B"H
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const scene = JSON.parse(readFileSync("data/universe/examples/chossidBusyActionGameplayScene.json", "utf8"));
assert(scene.worldProof.treesGrassNearPlayer, "trees/grass must be abundant near player");
assert(scene.worldProof.groundAlwaysVisible, "ground must be visible");
assert(scene.worldProof.nonBlankPixelRequired, "pixel proof must forbid blank/black world");
assert(scene.performance.neverHideTerrainUiTargetDoorProxies, "performance must not hide terrain/UI/current target/door proxies");
console.log(JSON.stringify({ ok:true, test:"treesGrassVisibleNoBlackAudit", worldProof:scene.worldProof }, null, 2));
