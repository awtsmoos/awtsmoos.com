//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file sharedJourneyBrowserVerification.mjs
 * @description Proves Solo preservation and two-browser authoritative fellowship.
 * The Awtsmoos recreates each traveler and one shared lamp every instant;
 * Awtsmoos.com receives screenshots and measured truth rather than hopeful claims.
 */

import assert from 'node:assert/strict';
import path from 'node:path';
import {
	browserErrors,
	chooseShared,
	chooseSolo,
	closeJourneyBrowser,
	createJourneyBrowser,
	journeyState,
	lightSharedLamp,
	moveEast
} from './SharedJourneyBrowserActions.mjs';
import { startSharedJourneyTestServer } from './SharedJourneyTestServer.mjs';

const EVIDENCE_ROOT = 'ai-thoughts/2026-07-13-1917-edt-shared-world-revelation';
const screenshotPath = name => path.resolve(EVIDENCE_ROOT, name);
const playerState = client => client.evaluate(`(()=>{
	const state=OhrHaGnuz.journey.store.snapshot();
	return state.road.players.find(player=>player.id===state.playerId);
})()`);

async function assertNoBrowserErrors(browser) {
	const captured = await browser.client.evaluate(`globalThis.__OHR_TEST_ERRORS__||[]`);
	assert.deepEqual(captured, []);
	assert.deepEqual(browserErrors(browser.client), []);
}

async function run() {
	const server = await startSharedJourneyTestServer();
	const url = `${server.url}/geelooy/games/ohr-hagnuz/?verify=shared-road-${Date.now()}`;
	let first;
	let second;
	try {
		first = await createJourneyBrowser(url);
		const initial = await first.client.evaluate(`({
			offline:OhrHaGnuz.journey.store.snapshot().connection,
			socket:OhrHaGnuz.journey.connection.socket,
			gate:Boolean(document.querySelector('#journey-mode-root'))
		})`);
		assert.deepEqual(initial, { offline: 'offline', socket: null, gate: true });
		await first.client.screenshot(screenshotPath('browser-desktop-journey-choice.png'));

		const solo = await chooseSolo(first.client);
		assert.deepEqual(solo, { shell: true, ignited: true, socket: null });
		const firstJoined = await chooseShared(first.client, 'Neriah');
		assert.equal(firstJoined.road.players.length, 1);

		second = await createJourneyBrowser(url);
		await chooseShared(second.client, 'Taliah');
		await first.client.waitFor(`OhrHaGnuz.journey.store.snapshot().road.players.length===2`);
		await second.client.waitFor(`OhrHaGnuz.journey.store.snapshot().road.players.length===2`);
		await first.client.screenshot(screenshotPath('browser-desktop-two-travelers.png'));

		await moveEast(first.client, 5);
		await first.client.waitFor(`(()=>{
			const state=OhrHaGnuz.journey.store.snapshot();
			return state.road.players.find(player=>player.id===state.playerId)?.x===7;
		})()`);
		await lightSharedLamp(first.client);
		await first.client.waitFor(`OhrHaGnuz.journey.store.snapshot().road.lamp.lit===true`);
		await second.client.waitFor(`OhrHaGnuz.journey.store.snapshot().road.lamp.lit===true`);
		const litPlayer = await playerState(first.client);
		assert.equal(litPlayer.sharedLight, 1);
		await lightSharedLamp(first.client);
		await new Promise(resolve => setTimeout(resolve, 150));
		assert.equal((await playerState(first.client)).sharedLight, 1);
		await first.client.screenshot(screenshotPath('browser-desktop-shared-lamp.png'));

		await first.client.send('Emulation.setDeviceMetricsOverride', {
			width: 390,
			height: 844,
			deviceScaleFactor: 1,
			mobile: true
		});
		await first.client.screenshot(screenshotPath('browser-mobile-shared-road.png'));
		await chooseSolo(first.client);
		await second.client.waitFor(`OhrHaGnuz.journey.store.snapshot().road.players.length===1`);
		assert.equal((await journeyState(second.client)).road.players[0].displayName, 'Taliah');
		await assertNoBrowserErrors(first);
		await assertNoBrowserErrors(second);

		const result = {
			firstJoined: firstJoined.playerId,
			lampLit: (await journeyState(second.client)).road.lamp.lit,
			remainingTraveler: 'Taliah',
			soloPreserved: solo.shell && solo.ignited,
			twoTravelers: true
		};
		console.log(JSON.stringify(result, null, 2));
		console.log('BH_SHARED_JOURNEY_BROWSER_PASS');
	} finally {
		if (first) await closeJourneyBrowser(first);
		if (second) await closeJourneyBrowser(second);
		await server.close();
	}
}

await run();
