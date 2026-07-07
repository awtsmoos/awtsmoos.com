// B"H
import assert from "node:assert/strict";
import { movieActionNames, normalizeMovieActionName } from "../../ckidsAwtsmoos/studio/movie/MovieActionCatalog.js";
import { generateProceduralMovie } from "../../ckidsAwtsmoos/studio/movie/ProceduralMovieGenerator.js";
import { createEncodingJob } from "../../ckidsAwtsmoos/studio/movie/AiVideoJsonBridge.js";
const names = movieActionNames();
for (const name of ["walk", "run", "walk_Armature", "run_Armature", "punch", "castStorm", "graze", "prowl", "flee", "hebrew_letter_release"]) assert(names.includes(name), `missing action ${name}`);
assert.equal(normalizeMovieActionName("run_Armature"), "run");
assert.equal(normalizeMovieActionName("graze"), "graze");
const generated = generateProceduralMovie({ duration:22 });
assert(generated.proceduralDirector.cameraCalls.length >= 6);
assert(generated.timeline.tracks.find(t => t.kind === "camera").clips.every(c => c.payload.cameraCall));
const job = createEncodingJob({ video:{ id:"audit", durationSec:12, shots:[{ cameraCall:"AUDIT_WIDE", shot:"wide", subject:"village", action:"walk", duration:3 }], animals:[{ id:"goat", species:"goat", action:"graze" }], captions:[{ text:"huge", style:"gold" }], speechBubbles:[{ actor:"goat", text:"meh" }] } });
assert(job.summary.cameraCalls.includes("AUDIT_WIDE"));
assert.equal(job.summary.counts.actor >= 2, true);
console.log(JSON.stringify({ ok:true, actions:names.length, cameraCalls:generated.proceduralDirector.cameraCalls, job:job.summary }, null, 2));
