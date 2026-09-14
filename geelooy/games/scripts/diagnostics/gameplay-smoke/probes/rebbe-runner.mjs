//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file rebbe-runner.mjs
 * @description Proves Rebbe Runner enters a real run, advances authoritative
 * distance/score, and obeys the visible Pause control on a phone viewport.
 *
 * Invariants:
 * - Begin/Pause actions travel through production buttons.
 * - Evidence reads the existing live runner rather than changing its state directly.
 * - Progress must advance before the probe can pass.
 */
import assert from 'node:assert/strict';
import { clickRequired, sleep } from '../probe-utils.mjs';

export const rebbeRunnerProbe = {
	slug: 'rebbe-runner',
	readyExpression: 'Boolean(window.rebbeRunner?.maslul)',
	async run(client) {
		const before = await snapshot(client);
		await clickRequired(client, '[data-action="primary"]');
		await sleep(700);
		const playing = await snapshot(client);
		assert.equal(playing.status, 'playing');
		assert.ok(playing.distance > before.distance, 'runner distance did not advance');
		assert.ok(playing.score > before.score, 'runner score did not advance');
		await clickRequired(client, '[data-action="pause"]');
		const paused = await snapshot(client);
		assert.equal(paused.status, 'paused');
		await clickRequired(client, '[data-action="pause"]');
		assert.equal((await snapshot(client)).status, 'playing');
		return { before, playing, paused };
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
