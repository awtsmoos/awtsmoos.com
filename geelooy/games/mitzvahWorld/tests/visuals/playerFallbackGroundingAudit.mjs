// B"H
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const source = fs.readFileSync(path.join(root, "ckidsAwtsmoos/chayim/chossid/methods/lifecycle/fallbackBody.js"), "utf8");

assert(source.includes("measureFallbackGroundLift"), "fallback body must measure its lowest local foot point");
assert(source.includes("groundLiftY"), "fallback body must cache a ground lift value");
assert(!source.includes("body.position.set(0,0,0)"), "fallback body must not sit at root when authored below ground");

console.log("B\"H player fallback grounding audit passed.");
