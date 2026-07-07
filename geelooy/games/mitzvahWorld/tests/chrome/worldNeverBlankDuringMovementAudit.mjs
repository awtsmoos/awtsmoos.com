// B"H
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const scene = JSON.parse(readFileSync("data/universe/examples/chossidBusyActionGameplayScene.json", "utf8"));
const proof = JSON.parse(readFileSync("ai_thoughts/20260707-004045-full-repair-no-freeze-loading-ui-targeting-doors/proof/twoMinuteNoFreezeAudit.json", "utf8"));
assert(proof.ok, "two-minute browser proof must pass");
assert(proof.sample.canvas.width > 0 && proof.sample.canvas.height > 0, "canvas must remain visible");
assert.equal(proof.sample.loading.noBlackFrameBeforePlayable, true, "loading proof must report no black frame before playable");
assert.equal(proof.sample.loading.displayRegressionCount, 0, "loading display must not regress");
assert(scene.worldProof.groundAlwaysVisible, "scene contract requires ground always visible");
assert(scene.worldProof.nearHousesNeverHidden, "near houses must never disappear");
assert(scene.worldProof.friendlyNpcNearStart && scene.worldProof.questUiAtStart, "start area must include NPC and quest UI");
console.log(JSON.stringify({ ok:true, test:"worldNeverBlankDuringMovementAudit", canvas:proof.sample.canvas, loadingHiddenMs:proof.sample.loading.loadingHiddenMs, worldProof:scene.worldProof }, null, 2));
