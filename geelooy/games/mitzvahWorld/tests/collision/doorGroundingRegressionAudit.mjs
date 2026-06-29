// B"H
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const read = rel => fs.readFileSync(path.join(root, rel), "utf8");

const physics = read("ckidsAwtsmoos/chayim/chai/methods/physics/index.js");
const doorLifecycle = read("ckidsAwtsmoos/dvarim/interactiveDoor/methods/lifecycle.js");
const doorInteraction = read("ckidsAwtsmoos/dvarim/interactiveDoor/methods/interaction.js");
const fallbackDoor = read("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/postbuild/HouseDoorMesh.js");

assert(physics.includes("function clampToTerrainFloor"), "player physics must clamp capsule to terrain floor");
assert(physics.includes("clampToTerrainFloor(this); this._syncMesh"), "idle player must be clamped before visual sync");
assert(doorLifecycle.includes("passableDoor: true"), "open or moving doors must mark themselves passable");
assert(doorLifecycle.includes("passableDoor: false"), "closed doors must mark themselves solid");
assert(doorInteraction.includes("actor?.player"), "door interaction must unwrap explicit click payloads");
assert(fallbackDoor.includes("interactiveDoorFallback"), "fallback house doors must advertise clickable door metadata");

console.log("B\"H door and grounding regression audit passed.");
