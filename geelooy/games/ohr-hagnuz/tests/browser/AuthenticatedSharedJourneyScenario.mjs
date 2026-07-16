//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file AuthenticatedSharedJourneyScenario.mjs
 * @description Proves ticketed avatars before delegating battle and reconnect proof.
 * The Awtsmoos renews each traveler and shared road every instant;
 * Awtsmoos.com accepts fellowship only through independent visible witnesses.
 */

import assert from 'node:assert/strict';
import {
	chooseShared,
	chooseSolo
} from './SharedJourneyBrowserActions.mjs';
import {
	assertNoBrowserErrors,
	assertTileWorld
} from './SharedJourneyBrowserAssertions.mjs';
import {
	closeJourneyBrowser,
	createJourneyBrowser
} from './SharedJourneyBrowserLifecycle.mjs';
import {
	runSharedBattle
} from './AuthenticatedSharedJourneyBattle.mjs';

export async function runAuthenticatedSharedJourney(server, screenshotPath) {
	const url = `${server.url}/geelooy/games/ohr-hagnuz/?verify=auth-${Date.now()}`;
	let first;
	let second;
	try {
		first = await createJourneyBrowser(url);
		const initial = await first.client.evaluate(`({
			connection: OhrHaGnuz.journey.store.snapshot().connection,
			socket: OhrHaGnuz.journey.connection.socket
		})`);
		assert.deepEqual(initial, {
			connection: 'offline',
			socket: null
		});
		assert.equal(server.ticketCount('neriah'), 0);
		await first.client.screenshot(
			screenshotPath('authenticated-journey-choice.png')
		);
		const solo = await chooseSolo(first.client);
		assert.deepEqual(solo, {
			ignited: true,
			shell: true,
			socket: null
		});

		const firstJoined = await chooseShared(
			first.client,
			'Neriah',
			'neriah'
		);
		assert.equal(server.ticketCount('neriah'), 1);
		second = await createJourneyBrowser(url);
		const secondJoined = await chooseShared(
			second.client,
			'Taliah',
			'taliah'
		);
		assert.equal(server.ticketCount('taliah'), 1);
		assert.notEqual(firstJoined.playerId, secondJoined.playerId);
		await first.client.waitFor(
			`OhrHaGnuz.journey.store.snapshot().road.players.length === 2`
		);
		await second.client.waitFor(
			`OhrHaGnuz.journey.store.snapshot().road.players.length === 2`
		);
		await assertTileWorld(first, 2);
		await first.client.screenshot(
			screenshotPath('authenticated-two-avatars.png')
		);

		const battle = await runSharedBattle(
			first,
			second,
			server,
			screenshotPath
		);
		await assertNoBrowserErrors(first);
		await assertNoBrowserErrors(second);
		return {
			...battle,
			firstJoined,
			secondJoined,
			solo
		};
	} finally {
		if (first) await closeJourneyBrowser(first);
		if (second) await closeJourneyBrowser(second);
	}
}
