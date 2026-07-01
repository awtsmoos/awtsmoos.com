// B"H
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");

const files = {
  ground:read("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/collision/GroundCollisionWorld.js"),
  house:read("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/collision/HouseCollisionWorld.js"),
  player:read("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/collision/PlayerCollisionBubble.js"),
  runtime:read("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/collision/CollisionRuntime.js"),
  villageGrounding:read("ckidsAwtsmoos/Olam/methods/loadNivrayim/villageGrounding.js"),
  basePhysics:read("ckidsAwtsmoos/chayim/chai/methods/physics/index.js"),
  wrapperPhysics:read("ckidsAwtsmoos/chayim/chai/methods/physics.js"),
  groundTruth:read("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/ground/GroundTruth.js"),
  livingRuntime:read("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/render/LivingRegionRuntime.js"),
  workerMessages:read("ckidsAwtsmoos/Olam/ikarOyvedManager/messages/WorkerMessageInterceptor.js"),
  indexHtml:read("index.html")
};

assert(files.ground.includes("intersectObjects(candidates, true)"), "ground authority raycasts only local candidate terrain meshes");
assert(!files.villageGrounding.includes("scene?.traverse?.(o => { if (terrainLike(o))"), "groundYAt must not traverse the scene in the hot path");
assert(files.house.includes("source:\"measured-mesh-bounds\""), "house colliders must carry measured mesh proof");
assert(files.house.includes("generatedFrom:\"child-mesh-world-bounds\""), "house proxies must say they come from child mesh bounds");
assert(files.player.includes("resolveMovement") && files.player.includes("groundPlayer"), "player bubble must own horizontal and vertical collision");
assert(files.runtime.includes("__AWTS_COLLISION_DIAG__") && files.runtime.includes("__AWTS_BUBBLE_DIAG__"), "collision diagnostics must be installed");
assert(files.workerMessages.includes("installWindowCollisionDiagnostics"), "main window must install collision diagnostic bridge");
assert(files.workerMessages.includes("window.__AWTS_COLLISION_DIAG__"), "window collision diagnostic must exist");
assert(files.villageGrounding.includes("__AWTS_GROUNDING_DIAG__"), "grounding diagnostics must remain exposed");
assert(files.basePhysics.includes("ensurePlayerCollisionBubble"), "base physics must use the player collision bubble");
assert(!files.basePhysics.includes("intersectObjects(this.olam.scene.children, true)"), "base movement must not raycast against scene.children");
assert(files.groundTruth.indexOf("meshGroundHit") < files.groundTruth.indexOf("TerrainMath.calculateHeightAt"), "GroundTruth must ask mesh authority before TerrainMath fallback");
assert(files.livingRuntime.includes("registerHouseRoot(olam, cottages"), "living cottages must register measured house roots");
assert(files.indexHtml.includes("__AWTS_NO_BLACK_DIAG__"), "no-black diagnostics must exist");
assert(!files.indexHtml.includes("guard-timeout-visible-fallback"), "no-black guard must not hide on fixed timeout");

console.log("B\"H meshCollisionAuthorityAudit passed.");
