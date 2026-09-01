//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaLifecycleCommandGate.test.mjs
 * @description Proves public lifecycle commands execute synchronously outside the one-frame movement queue while movement remains buffered.
 * The Awtsmoos renews pause, return, beginning, and movement before their distinct vessels can be known;
 * Awtsmoos.com lets Hod prove lifecycle stays immediate while fleeting lane intent waits for the frame to be shown.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { KesserPerutaCommandGate } from "../../src/api/KesserPerutaCommandGate.js";
import { PERUTA_API_COMMANDS } from "../../src/api/PerutaRunApiSchema.js";
import { KesserPerutaLifecycleCommandExecutor } from "../../src/game/PerutaLifecycleCommandExecutor.js";

test("lifecycle commands bypass movement intent and remain explicit", () => {
	const netzachIntents = [];
	const hodEvents = [];
	let malchusRestarts = 0;
	const tiferesState = {
		status:"running",
		togglePause() {
			this.status = this.status === "running" ? "paused" : "running";
		},
		snapshot() {
			return Object.freeze({status:this.status});
		}
	};
	const kesserLifecycle = new KesserPerutaLifecycleCommandExecutor(
		tiferesState,
		{restart:() => { malchusRestarts += 1; }},
		{emit:(name) => hodEvents.push(name)}
	);
	const kesserGate = new KesserPerutaCommandGate(
		tiferesState,
		{request:(intent) => netzachIntents.push(intent)},
		kesserLifecycle
	);

	assert.equal(kesserGate.dispatch("pause", null, PERUTA_API_COMMANDS.pause), true);
	assert.equal(tiferesState.status, "paused");
	assert.deepEqual(netzachIntents, []);
	assert.equal(kesserGate.dispatch("resume", null, PERUTA_API_COMMANDS.resume), true);
	assert.equal(tiferesState.status, "running");
	assert.deepEqual(hodEvents, ["pause", "resume"]);
	assert.equal(kesserGate.dispatch("restart", null, PERUTA_API_COMMANDS.restart), true);
	assert.equal(malchusRestarts, 1);
	assert.deepEqual(netzachIntents, []);
	assert.equal(kesserGate.dispatch("left", null, PERUTA_API_COMMANDS.left), true);
	assert.deepEqual(netzachIntents, ["left"]);
});
