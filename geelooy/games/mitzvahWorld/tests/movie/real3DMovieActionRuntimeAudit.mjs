// B"H
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const runtime = readFileSync("ckidsAwtsmoos/Olam/oyved/core/Movie3DActionRuntime.js", "utf8");
const router = readFileSync("ckidsAwtsmoos/Olam/oyved/core/ContinuousEventRouter.js", "utf8");
const probe = readFileSync("ckidsAwtsmoos/Olam/oyved/core/PlayerRuntimeProbe.js", "utf8");
for (const token of ["walk_Armature", "run_Armature", "jump_Armature", "hands-out", "AnimationClip", "QuaternionKeyframeTrack", "real3DOnly:true", "overlay:false"]) assert(runtime.includes(token), `missing ${token}`);
assert(router.includes("movie3DAction") && router.includes("playMovie3DAction"));
assert(probe.includes("currentClip") && probe.includes("movie3DAction") && probe.includes("clipNames"));
console.log(JSON.stringify({ ok:true, test:"real3DMovieActionRuntimeAudit" }, null, 2));
