//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file AuthenticatedSharedJourneyBattle.mjs
 * @description Drives lamp, cooperative combat, disconnect, resume, and mobile proof.
 * The Awtsmoos renews battle and continuity without making the browser sovereign;
 * Awtsmoos.com accepts only server-owned rewards that survive a dropped socket.
 */

import assert from 'node:assert/strict';
import {
	attackVeilWisp,
	dropSharedSocket,
	lightSharedLamp,
	moveEast,
	playerState
} from './SharedJourneyBrowserActions.mjs';
import {
	assertCombatRewards,
	assertTileWorld,
	waitForPlayerX
} from './SharedJourneyBrowserAssertions.mjs';

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

export async function runSharedBattle(first, second, server, screenshotPath) {
	await moveEast(first.client, 7);
	await moveEast(second.client, 7);
	await waitForPlayerX(first, 9);
	await waitForPlayerX(second, 9);
	await lightSharedLamp(first.client);
	await first.client.waitFor(`(() => {
		const state = OhrHaGnuz.journey.store.snapshot();
		return state.road.players.find(player => player.id === state.playerId)
			?.sharedLight === 1;
	})()`);
	await lightSharedLamp(first.client);
	await wait(140);
	assert.equal((await playerState(first.client)).sharedLight, 1);

	await attackVeilWisp(first.client);
	await attackVeilWisp(second.client);
	await wait(160);
	await attackVeilWisp(first.client);
	await attackVeilWisp(second.client);
	await first.client.waitFor(
		`OhrHaGnuz.journey.store.snapshot().road.encounter.defeated === true`,
		8000
	);
	await second.client.waitFor(
		`OhrHaGnuz.journey.store.snapshot().road.encounter.defeated === true`,
		8000
	);
	const rewards = await assertCombatRewards(first, second);
	await first.client.screenshot(screenshotPath('authenticated-wisp-defeated.png'));

	const beforeDrop = await playerState(first.client);
	await dropSharedSocket(first.client);
	await first.client.waitFor(
		`OhrHaGnuz.journey.store.snapshot().lastMessageType === 'journey.resumed'`,
		12000
	);
	const afterResume = await playerState(first.client);
	assert.equal(afterResume.id, beforeDrop.id);
	assert.equal(afterResume.x, beforeDrop.x);
	assert.equal(afterResume.passageShards, 1);
	assert.equal(afterResume.sharedLight, 3);
	assert.equal(server.ticketCount('neriah'), 1);
	await assertTileWorld(first, 2);

	await first.client.send('Emulation.setDeviceMetricsOverride', {
		deviceScaleFactor: 1,
		height: 844,
		mobile: true,
		width: 390
	});
	await first.client.screenshot(screenshotPath('authenticated-mobile-world.png'));
	return { afterResume, rewards };
}
