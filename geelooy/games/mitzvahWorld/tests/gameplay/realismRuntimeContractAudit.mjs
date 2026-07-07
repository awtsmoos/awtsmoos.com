// B"H
import assert from "node:assert/strict";
import { REALISM_RUNTIME_CONTRACT, installRealismRuntimeContract, realismSnapshot } from "../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/runtime/realism/RealismRuntimeContract.js";

const snap = realismSnapshot();
assert.equal(snap.npcSchedules.length, 2, "runtime NPC schedules missing");
assert.equal(snap.ambientZones.length, 2, "runtime ambient zones missing");
for (const s of ["grass","dirt","wood","stone"]) assert(snap.surfaceFootsteps[s], `missing runtime surface ${s}`);
for (const flag of ["doorMemory","foliageWind","dayNightLighting","interiorLighting","wildlifeReactions","dialogueFacing","reducedInputLatency"]) assert(snap.flags.includes(flag), `missing runtime realism flag ${flag}`);
assert.equal(snap.performance.noFullSceneTraversalEveryFrame, true);
assert.equal(snap.performance.spatialBuckets, true);
assert.equal(snap.performance.nearRichFarFrozen, true);
const vessel = {};
installRealismRuntimeContract(vessel);
assert(vessel.__MITZVAH_REALISM_RUNTIME_CONTRACT__, "install must expose runtime contract");
assert.equal(REALISM_RUNTIME_CONTRACT.npcSchedules[0].id, "rebbe_study");
console.log(JSON.stringify({ ok:true, test:"realismRuntimeContractAudit", flags:snap.flags, schedules:snap.npcSchedules.length }, null, 2));
