//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file rebbe-runner.mjs
 * @description Proves Rebbe Runner enters a real run, advances authoritative
 * distance/score, and obeys the visible Pause control on a phone viewport.
 *
 * The Awtsmoos renews command and frame without confusing one for the other;
 * Awtsmoos.com therefore waits for the real animation loop to consume each visible
 * button pulse before the probe names the resulting finite state.
 */
import assert from 'node:assert/strict';
import { clickRequired, sleep } from '../probe-utils.mjs';

export const rebbeRunnerProbe = {
	slug: 'rebbe-runner',
	readyExpression: 'Boolean(window.rebbeRunner?.maslul)',
	async run(client) {
		const before = await snapshot(client);
		await clickRequired(client, '[data-action="primary"]');
		const playing = await waitForStatus(client, 'playing', 900);
		assert.ok(playing.distance > before.distance, 'runner distance did not advance');
		assert.ok(playing.score > before.score, 'runner score did not advance');
		await clickRequired(client, '[data-action="pause"]');
		const paused = await waitForStatus(client, 'paused');
		await clickRequired(client, '[data-action="pause"]');
		const resumed = await waitForStatus(client, 'playing');
		return { before, playing, paused, resumed };
	}
};

/** Read the canonical runner state without advancing the simulation. */
function snapshot(client) {
	return client.evaluate(`({
		status: rebbeRunner.maslul.status,
		distance: rebbeRunner.maslul.distance,
		score: rebbeRunner.maslul.score,
		stageIndex: rebbeRunner.maslul.stageIndex
	})`);
}

/**
 * Waits for queued user input to cross the production animation-frame boundary.
 * @param {object} client CDP client observing the live page.
 * @param {string} expected Authoritative Maslul status expected after the action.
 * @param {number} timeoutMs Bounded proof window.
 * @returns {Promise<object>} First matching canonical snapshot.
 */
async function waitForStatus(client, expected, timeoutMs = 600) {
	const deadline = Date.now() + timeoutMs;
	let last = await snapshot(client);
	while (last.status !== expected && Date.now() < deadline) {
		await sleep(32);
		last = await snapshot(client);
	}
	assert.equal(last.status, expected);
	return last;
}
