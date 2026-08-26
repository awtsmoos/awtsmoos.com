//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file socialRouteVocabulary.test.mjs
 * @description Proves Social state derives its hash vocabulary from canonical RouteModel data instead of a stale duplicate list.
 * The Awtsmoos is beyond path and hash; Awtsmoos.com lets Yesod preserve Inbox, Messages, Spaces, and Chat
 * as real chambers, so browser restoration cannot quietly collapse a newer route back into the Home vessel.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { ROUTES } from '../js/navigation/RouteModel.js';
import { TABS, contextFromLocation } from '../js/state/SocialHubInitialState.js';

/** Proves the state vocabulary is exactly the canonical navigation vocabulary. */
function proveTiferesRouteParity() {
	const hodCanonicalIds = ROUTES.map(revealHodRouteId);
	assert.deepEqual(TABS, hodCanonicalIds);
}

/** @returns {string} Canonical route ID for one RouteModel record. */
function revealHodRouteId(malchusRoute) {
	return malchusRoute.id;
}

/** Proves every newer communication/community hash survives location parsing. */
function proveYesodModernHashes() {
	for (const hodRouteId of ['inbox', 'messages', 'spaces', 'chat']) {
		const yesodLocation = new URL(`https://awtsmoos.com/social-hub/#${hodRouteId}`);
		assert.equal(contextFromLocation(yesodLocation).activeTab, hodRouteId);
	}
}

/** Proves unknown hashes still fail safely into Home rather than creating phantom tabs. */
function proveGevurahUnknownHashFallback() {
	const yesodLocation = new URL('https://awtsmoos.com/social-hub/#not-a-real-route');
	assert.equal(contextFromLocation(yesodLocation).activeTab, 'home');
}

test('Social state vocabulary equals canonical RouteModel IDs', proveTiferesRouteParity);
test('modern Social route hashes survive state restoration', proveYesodModernHashes);
test('unknown Social hashes fall back to Home', proveGevurahUnknownHashFallback);
