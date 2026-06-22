// B"H
/** @file postLoadFpsSmoke.js @description ESM static smoke for post-load FPS wiring. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
function assert(condition, message) { if (!condition) throw new Error(message); }
const index = read("index.html");
const probe = read("systems/performance/PostLoadFpsProbe.js");
const counters = read("systems/performance/FrameSubsystemCounters.js");
const assertions = read("systems/performance/NoJankAssertions.js");
assert(index.includes("systems/performance/PostLoadFpsProbe.js"), "index.html must load PostLoadFpsProbe.js");
assert(probe.includes("assertPostLoadFps"), "FPS probe must call no-jank assertions");
assert(probe.includes("sceneReady") && probe.includes("QUIET_MS"), "FPS probe must wait for post-load quiet period");
assert(probe.includes("__AWTSMOOS_POST_LOAD_FPS_REPORT__"), "FPS report global must exist");
assert(counters.includes("__AWTSMOOS_FRAME_COUNTERS__"), "frame counters global must exist");
assert(assertions.includes("NoJankAssertions") && assertions.includes("minFps"), "no-jank assertion must inspect FPS");
console.log(JSON.stringify({ ok:true, test:"postLoadFpsSmoke" }, null, 2));
