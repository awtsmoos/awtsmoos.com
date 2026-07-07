// B"H
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const registry = readFileSync("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/houses/door/DoorInteractionRegistry.js", "utf8");
const responsive = readFileSync("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/mobile/ResponsiveActionDispatcher.js", "utf8");
const contracts = readFileSync("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/data/mobile/ResponsiveContracts.js", "utf8");

assert(registry.includes("pointerdown"), "door proxy must accept pointerdown so mobile taps reach the same toggle path");
assert(registry.includes("interactionRadius:DOOR_RADIUS"), "mobile tap target must expose a stable radius");
assert(responsive.includes("input.type === \"tap\"") && responsive.includes("action:\"activate\""), "mobile tap must normalize to activate");
assert(contracts.includes("tap") && contracts.includes("doubleTap"), "mobile contract must list tap activation gestures");
console.log(JSON.stringify({ ok:true, audit:"doorMobileTapAudit" }, null, 2));
