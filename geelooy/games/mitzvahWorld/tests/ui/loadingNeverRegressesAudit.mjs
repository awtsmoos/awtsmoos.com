// B"H
import assert from "node:assert/strict";
import { simulateRawResetForProof, update } from "../../ckidsAwtsmoos/Olam/uiManager/logic/LoadingProgressBridge.js";
import { state } from "../../ckidsAwtsmoos/Olam/uiManager/logic/loading/LoadingState.js";

const seen = [];
function sample(stage, total) {
  update({ stage, total, synthetic:true });
  seen.push({ stage, total:state.total, visualFloor:state.visualFloor, displayed:state.minDisplayedAfterStart });
}

sample("Opening the world", 4);
sample("Preparing the Chossid", 16);
sample("Drawing near village", 28);
sample("Starting controls", 41);
sample("Streaming life", 64);
sample("worker:raw-reset", 0);
sample("texture:raw-regress", 12);
sample("loadedWorld", 97);
sample("Still drawing the playable world", 90);

const proof = simulateRawResetForProof();
assert.equal(proof.visualNeverResetToZero, true, "visible percent must never reset to zero after positive progress");
assert.equal(proof.neverResetToZeroAfterPositive, true, "loader must report no visible reset after raw reset");
assert.equal(proof.displayRegressionCount, 0, "visible display regression count must be zero");
assert.equal(proof.rawRegressionCount, 0, "normalized raw progress must be monotonic");
assert(proof.rawInputRegressionCount >= 1, "audit must retain debug count for stale caller inputs");
assert(proof.rawZeroRequests >= 1, "audit must prove raw zero requests are normalized");
assert(state.visualFloor >= 97, "visual floor must stay near completion after regressions");
console.log(JSON.stringify({ ok:true, test:"loadingNeverRegressesAudit", seen, proof:{ displayRegressionCount:proof.displayRegressionCount, rawRegressionCount:proof.rawRegressionCount, rawInputRegressionCount:proof.rawInputRegressionCount, rawZeroRequests:proof.rawZeroRequests, minDisplayedAfterStart:proof.minDisplayedAfterStart } }, null, 2));
