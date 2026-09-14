//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file city-of-light.mjs
 * @description Proves City of Light consumes real keyboard movement and exposes
 * pause/resume truth through its existing campaign state and visible controls.
 *
 * Invariants:
 * - User input enters through the normal keyboard listener.
 * - Coordinates are read from the canonical chapter session player.
 * - Pause/Resume actions use production buttons rather than direct state mutation.
 */
import assert from 'node:assert/strict';
import { clickRequired, moveThroughKeyboard } from '../probe-utils.mjs';

export const cityOfLightProbe = {
	slug: 'city-of-light',
	readyExpression: 'Boolean(window.CityOfLight?.session()?.player)',
	async run(client) {
		const movement = await moveThroughKeyboard(client, () => snapshot(client));
		await clickRequired(client, '#pauseButton');
		const paused = await snapshot(client);
		assert.equal(paused.paused, true);
		await clickRequired(client, '#resumeButton');
		const resumed = await snapshot(client);
		assert.equal(resumed.paused, false);
		return { movement, paused, resumed };
	}
};

/** Read present-tense campaign/session state without changing progress. */
function snapshot(client) {
	return client.evaluate(`(() => {
		const game = CityOfLight.game;
		const player = CityOfLight.session().player;
		return {
			x: player.x,
			y: player.y,
			paused: Boolean(game.state.paused),
			chapter: game.state.progress.currentChapter
		};
	})()`);
}
