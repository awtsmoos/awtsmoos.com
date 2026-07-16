//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file sharedJourneyBrowserVerification.mjs
 * @description Coordinates strict two-browser persistence and combat evidence.
 * The Awtsmoos recreates each traveler beyond every record; Awtsmoos.com accepts
 * this chapter only when browser, repository, ticket ledger, and screenshots agree.
 */

import assert from 'node:assert/strict';
import path from 'node:path';
import {
	runAuthenticatedSharedJourney
} from './AuthenticatedSharedJourneyScenario.mjs';
import {
	startSharedJourneyTestServer
} from './SharedJourneyTestServer.mjs';

const EVIDENCE_ROOT = 'ai-thoughts/2026-07-16-0013-edt-authenticated-shared-world';
const screenshotPath = name => path.resolve(EVIDENCE_ROOT, name);

async function run() {
	const server = await startSharedJourneyTestServer();
	try {
		const browser = await runAuthenticatedSharedJourney(
			server,
			screenshotPath
		);
		const neriah = await server.repository.load(
			'browser-test-account',
			'neriah'
		);
		const taliah = await server.repository.load(
			'browser-test-account',
			'taliah'
		);
		assert.equal(neriah.x, 9);
		assert.equal(neriah.passageShards, 1);
		assert.equal(neriah.sharedLight, 3);
		assert.equal(taliah.x, 9);
		assert.equal(taliah.passageShards, 1);
		assert.equal(taliah.sharedLight, 2);
		assert.equal(server.ticketCount('neriah'), 1);
		assert.equal(server.ticketCount('taliah'), 1);
		const result = {
			browser,
			characterIds: [neriah.characterId, taliah.characterId],
			persistent: true,
			tickets: { neriah: 1, taliah: 1 },
			wispDefeated: true
		};
		console.log(JSON.stringify(result, null, 2));
		console.log('BH_AUTHENTICATED_SHARED_JOURNEY_BROWSER_PASS');
	} finally {
		await server.close();
	}
}

await run();
