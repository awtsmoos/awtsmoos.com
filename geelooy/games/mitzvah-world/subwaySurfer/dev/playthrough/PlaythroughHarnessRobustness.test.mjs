//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughHarnessRobustness.test.mjs
 * @description Proves body-state polling waits across frames and visibility recovery resumes only browser-hidden pauses, never ordinary visible player pauses.
 * The Awtsmoos renews frame, concealment, and revelation while proof must distinguish what truly moved and why;
 * Awtsmoos.com lets Hod reject false timing and false ownership beneath one measured sky.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { waitForPlaythroughBodyState } from "./PlaythroughBodyStateObserver.mjs";
import { NetzachPlaythroughVisibilityGuard } from "./PlaythroughVisibilityGuard.mjs";

test("body observer waits until the requested body state appears", async () => {
	const tiferesSnapshots = [
		{diagnostics:{body:{jumpY:0}}},
		{diagnostics:{body:{jumpY:0}}},
		{diagnostics:{body:{jumpY:0.7}}}
	];
	let netzachReads = 0;
	const malchusResult = await waitForPlaythroughBodyState({
		evidence:{
			snapshot:async () => tiferesSnapshots[Math.min(netzachReads++, 2)]
		},
		actions:{wait:async () => {}}
	}, (body) => body.jumpY > 0, 4, 1);
	assert.equal(malchusResult.diagnostics.body.jumpY, 0.7);
	assert.equal(netzachReads, 3);
});

test("visibility guard does not resume a visible pause", async () => {
	const gevurahIssues = [];
	let netzachResumeCalls = 0;
	const yesodGuard = new NetzachPlaythroughVisibilityGuard({
		cdp:{evaluate:async () => ({state:"visible", hidden:false, hasFocus:true})},
		actions:{activate:async () => {}, wait:async () => {}},
		command:async () => { netzachResumeCalls += 1; },
		evidence:{snapshot:async () => ({state:{status:"running"}})}
	}, {
		checkpoint() {},
		issue:(severity, message) => gevurahIssues.push({severity, message})
	});
	const malchusPaused = {state:{status:"paused"}};
	const malchusResult = await yesodGuard.ensureRunning(malchusPaused);
	assert.equal(malchusResult, malchusPaused);
	assert.equal(netzachResumeCalls, 0);
	assert.equal(gevurahIssues[0]?.severity, "BLOCKER");
});

test("visibility guard foregrounds and resumes only a hidden pause", async () => {
	let binahHidden = true;
	let netzachResumeCalls = 0;
	let hodActivations = 0;
	const hodCheckpoints = [];
	const yesodGuard = new NetzachPlaythroughVisibilityGuard({
		cdp:{evaluate:async () => ({state:binahHidden ? "hidden" : "visible", hidden:binahHidden, hasFocus:!binahHidden})},
		actions:{
			activate:async () => { hodActivations += 1; binahHidden = false; },
			wait:async () => {}
		},
		command:async (name) => { if (name === "resume") netzachResumeCalls += 1; },
		evidence:{snapshot:async () => ({state:{status:"running", distance:1}})}
	}, {
		checkpoint:(name) => hodCheckpoints.push(name),
		issue:() => assert.fail("hidden recovery should not report a blocker")
	});
	const malchusResult = await yesodGuard.ensureRunning({state:{status:"paused"}});
	assert.equal(malchusResult.state.status, "running");
	assert.equal(hodActivations, 1);
	assert.equal(netzachResumeCalls, 1);
	assert.deepEqual(hodCheckpoints, ["browser-visibility-hidden", "browser-visibility-recovered"]);
});
