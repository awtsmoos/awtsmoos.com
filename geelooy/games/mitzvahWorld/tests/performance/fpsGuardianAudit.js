// B"H
/** @file fpsGuardianAudit.js @description Static audit for the adaptive 60 FPS guardian wiring. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
function assert(condition, message) { if (!condition) throw new Error(message); }
const index = read("index.html");
const guardian = read("systems/performance/FpsGuardian.js");
const probe = read("systems/performance/PostLoadFpsProbe.js");
const wildlife = read("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/render/RegionWildlifeRenderer.js");
const region = read("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/render/LivingRegionRuntime.js");
assert(index.includes("systems/performance/FpsGuardian.js"), "index.html must load FpsGuardian.js");
assert(guardian.includes("__AWTSMOOS_FPS_GUARDIAN__"), "guardian global must exist");
assert((guardian.match(/name:/g) || []).length >= 5, "guardian must expose multiple rich-world LOD stages");
assert(guardian.includes("TARGET = 60") || guardian.includes("TARGET=60"), "guardian must target 60 FPS");
assert(guardian.includes("requestAnimationFrame"), "guardian must sample real frames");
assert(probe.includes("fpsGuardian"), "post-load FPS report must include guardian state");
assert(wildlife.includes("guardianWildlifeCadence"), "wildlife ticker must honor guardian cadence");
assert(region.includes("guardianConfig") && region.includes("visualTickSec"), "living-region visual ticker must honor guardian cadence");
console.log(JSON.stringify({ ok:true, test:"fpsGuardianAudit" }, null, 2));
