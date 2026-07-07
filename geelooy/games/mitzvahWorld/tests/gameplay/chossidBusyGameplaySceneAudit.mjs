// B"H
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { exportAiVideoCutscene } from "../../ckidsAwtsmoos/studio/movie/AiVideoJsonBridge.js";
import { CHOSSID_ACTION_SAMPLE_PROJECT } from "../../ckidsAwtsmoos/studio/movie/ChossidActionSampleClip.js";

const scene = JSON.parse(readFileSync("data/universe/examples/chossidBusyActionGameplayScene.json", "utf8"));
assert.equal(scene.world.playable, true, "scene must be playable");
assert.equal(scene.world.durationSec, 20, "scene must be the requested 20 seconds");
assert.equal(scene.player.model, "chossid.glb", "scene must use chossid.glb");
for (const action of ["walk", "run", "jump", "talk"]) assert(scene.player.actions.includes(action), `missing player action ${action}`);
for (const hud of ["health", "targeting", "x-action", "r-action", "quest", "joystick", "jump"]) assert(scene.hud.required.includes(hud), `missing HUD ${hud}`);
for (const type of ["friendly-npc", "animal", "monster", "door", "interactable"]) assert(scene.targets.some(t => t.type === type), `missing target type ${type}`);
assert(scene.doors.some(d => d.clickable && d.tappable && d.closedBlocks && d.openPasses && d.collisionUpdates), "door fixture must prove click/tap/collision states");
assert(scene.houses.some(h => h.stories >= 2 && h.stairs && h.interiorAccessible && h.octree), "house fixture must include multistory stairs octree proof");
assert(scene.worldProof.groundAlwaysVisible && scene.worldProof.terrainNeverHiddenByLod && scene.worldProof.nonBlankPixelRequired, "world proof must forbid blank terrain");
assert(scene.studyLoop.dialogueOverlay && scene.studyLoop.canStudyLongTime, "study loop must be explicit");
const movie = exportAiVideoCutscene(CHOSSID_ACTION_SAMPLE_PROJECT);
assert.equal(movie.summary.durationSec, scene.movie.durationSec, "scene movie duration must match generator");
for (const action of scene.movie.actions) assert(movie.summary.customActions.includes(action), `movie generator missing ${action}`);
console.log(JSON.stringify({ ok:true, test:"chossidBusyGameplaySceneAudit", scene:scene.world.id, targets:scene.targets.length, movieActions:scene.movie.actions }, null, 2));
