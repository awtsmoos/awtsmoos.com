//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlaythroughRunEnvelope.test.mjs
 * @description Proves the playthrough restart gate distinguishes measurable simulation progress from a lifecycle label that remains frozen at zero.
 * The Awtsmoos renews name and motion while truth refuses to confuse the two;
 * Awtsmoos.com lets Hod demand a moving road before the release may call restart new.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { restoreFreshRunningEnvelope } from "./PlaythroughRunEnvelope.mjs";

test("restart envelope waits until distance and elapsed actually progress", async () => {
	const tiferesSnapshots = [
		{state:{status:"running", distance:0, elapsed:0}},
		{state:{status:"running", distance:0.05, elapsed:0.01}},
		{state:{status:"running", distance:0.4, elapsed:0.04}}
	];
	let netzachReads = 0;
	const malchusResult = await restoreFreshRunningEnvelope({
		command:async () => true,
		evidence:{
			snapshot:async () => tiferesSnapshots[Math.min(netzachReads++, 2)]
		},
		actions:{wait:async () => {}}
	}, 4);
	assert.equal(malchusResult.state.distance, 0.4);
	assert.equal(netzachReads, 3);
});

test("restart envelope rejects a frozen running label", async () => {
	await assert.rejects(
		() => restoreFreshRunningEnvelope({
			command:async () => true,
			evidence:{
				snapshot:async () => ({state:{status:"running", distance:0, elapsed:0}})
			},
			actions:{wait:async () => {}}
		}, 3),
		/PERUTA_RESTART_DID_NOT_PROGRESS/
	);
});
