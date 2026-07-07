// B"H
import assert from "node:assert/strict";
import { exportAiVideoCutscene } from "../../ckidsAwtsmoos/studio/movie/AiVideoJsonBridge.js";
import { CHOSSID_ACTION_SAMPLE_PROJECT, requiredChossidActionProofs } from "../../ckidsAwtsmoos/studio/movie/ChossidActionSampleClip.js";
import { createMovieMakerState, exerciseMovieMaker } from "../../ckidsAwtsmoos/studio/movie/MovieMakerApp.js";

const built = exportAiVideoCutscene(CHOSSID_ACTION_SAMPLE_PROJECT);
const actorTrack = built.timeline.tracks.find(track => track.kind === "actor");
const actorClips = actorTrack?.clips || [];
const actions = actorClips.map(clip => clip.payload?.action).filter(Boolean);
const chossid = actorClips.filter(clip => clip.payload?.actor === "chossid");

assert.equal(built.summary.durationSec, 20, "sample must be exactly 20 seconds");
assert(chossid.every(clip => clip.payload?.aiVideo === true), "chossid clips must come through the AI video runtime path");
assert(chossid.some(clip => clip.payload?.model === "chossid.glb") || built.project.video.characters.some(actor => actor.model === "chossid.glb"), "sample must use chossid.glb");
for (const action of requiredChossidActionProofs()) assert(actions.includes(action), `missing chossid action proof ${action}`);
for (const call of ["BUSY_01_WALK_TALK", "BUSY_02_RUN", "BUSY_03_JUMP", "BUSY_04_TALK"]) assert(built.summary.cameraCalls.includes(call), `missing camera call ${call}`);
assert(built.summary.counts.actor >= 8, "busy sample must include chossid, rebbes/students, shot actions, and animals");
assert(built.summary.counts.dialogue >= 2, "talking must create dialogue clips");
assert(built.summary.counts.audio >= 1, "busy sample must include audio life");

const state = createMovieMakerState();
const exercised = exerciseMovieMaker(state);
assert.equal(exercised.job.summary.durationSec, 20, "movie maker default sample must encode the 20 second clip");
for (const action of requiredChossidActionProofs()) assert(exercised.job.summary.customActions.includes(action), `encoding job missing custom action ${action}`);
console.log(JSON.stringify({ ok:true, test:"chossidGlbBusyActionSampleAudit", duration:built.summary.durationSec, actions, cameraCalls:built.summary.cameraCalls, counts:built.summary.counts }, null, 2));
