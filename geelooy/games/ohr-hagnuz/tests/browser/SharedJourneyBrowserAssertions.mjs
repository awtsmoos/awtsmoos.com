//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedJourneyBrowserAssertions.mjs
 * @description Measures rendered tiles, authoritative rewards, and browser errors.
 * The Awtsmoos renews appearance without making appearance proof by itself;
 * Awtsmoos.com joins DOM evidence to server state before accepting completion.
 */

import assert from 'node:assert/strict';
import {
	browserErrors
} from './SharedJourneyBrowserLifecycle.mjs';
import {
	journeyState,
	playerState
} from './SharedJourneyBrowserActions.mjs';

export async function assertNoBrowserErrors(browser) {
	const captured = await browser.client.evaluate(`
		globalThis.__OHR_TEST_ERRORS__ || []
	`);
	assert.deepEqual(captured, []);
	assert.deepEqual(browserErrors(browser.client), []);
}

export async function assertTileWorld(browser, travelerCount) {
	const projection = await browser.client.evaluate(`({
		cells: document.querySelectorAll('.shared-road-cell').length,
		travelers: document.querySelectorAll('.road-traveler').length,
		wisp: Boolean(document.querySelector('.veil-wisp')),
		lamp: Boolean(document.querySelector('.road-lamp'))
	})`);
	assert.deepEqual(projection, {
		cells: 117,
		lamp: true,
		travelers: travelerCount,
		wisp: true
	});
}

export async function waitForPlayerX(browser, x) {
	await browser.client.waitFor(`(() => {
		const state = OhrHaGnuz.journey.store.snapshot();
		const player = state.road?.players?.find(
			entry => entry.id === state.playerId
		);
		return player?.x === ${Number(x)};
	})()`, 8000);
	return playerState(browser.client);
}

export async function assertCombatRewards(first, second) {
	const firstState = await playerState(first.client);
	const secondState = await playerState(second.client);
	assert.equal(firstState.passageShards, 1);
	assert.equal(secondState.passageShards, 1);
	assert.equal(firstState.sharedLight, 3);
	assert.equal(secondState.sharedLight, 2);
	assert.equal((await journeyState(first.client)).road.encounter.defeated, true);
	assert.equal((await journeyState(second.client)).road.encounter.defeated, true);
	return { firstState, secondState };
}
