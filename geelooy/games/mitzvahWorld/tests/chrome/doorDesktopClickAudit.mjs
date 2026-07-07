// B"H
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const registry = readFileSync("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/houses/door/DoorInteractionRegistry.js", "utf8");
const runtime = readFileSync("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/houses/door/DoorInteractionRuntime.js", "utf8");

assert(registry.includes("click|pointerdown|interact"), "door registry must accept desktop click/pointerdown actions");
assert(registry.includes("toggleDoor(olam, entry, cottageRoot)"), "desktop click must toggle the real door runtime");
assert(registry.includes("click-toggle"), "desktop click must publish diagnostic proof");
assert(runtime.includes("openDoor") && runtime.includes("closeDoor"), "door runtime must support open and close");
assert(runtime.includes("refreshCollision(olam, root, \"door-open\"") && runtime.includes("refreshCollision(olam, root, \"door-close\""), "door open/close must refresh collision");
console.log(JSON.stringify({ ok:true, audit:"doorDesktopClickAudit" }, null, 2));
