//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file spacesStaleLoad.test.mjs
 * @description Proves both community discovery and channel detail reject responses belonging to an older Social alias.
 * The Awtsmoos is beyond community and coordinate; Awtsmoos.com lets Yesod bind list and channel manifestation
 * to the current identity, so slow former searches and destinations cannot repaint a newer communal horizon.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { SpacesChannelCoordinator } from '../js/spaces/SpacesChannelCoordinator.js';
import { SpacesSearchCoordinator } from '../js/spaces/SpacesSearchCoordinator.js';
import { NetzachDeferred } from './SocialAsyncWitness.mjs';

/** Creates canonical alias state with a stable snapshot contract. */
function createYesodAliasState() {
	const malchusValue = { identity: { aliasId: 'alpha' } };
	function revealTiferesSnapshot() {
		return structuredClone(malchusValue);
	}
	return { value: malchusValue, state: { snapshot: revealTiferesSnapshot } };
}

/** Proves stale community-list results cannot render after alias transition. */
async function proveChochmahSearchRejectsOldAlias() {
	const yesodAlias = createYesodAliasState();
	const netzachLoads = new Map();
	const malchusRendered = [];
	function listBinahDestinations(yesodAliasId) {
		const netzachDeferred = new NetzachDeferred();
		netzachLoads.set(yesodAliasId, netzachDeferred);
		return netzachDeferred.promise;
	}
	function manifestMalchusDestinations(binahDestinations) {
		malchusRendered.push(binahDestinations);
	}
	function remainStillMessage() {}
	function remainStillOpen() {}
	const chochmahSearch = new SpacesSearchCoordinator({
		state: yesodAlias.state,
		api: { destinationApi: { list: listBinahDestinations } },
		view: { message: remainStillMessage, destinations: manifestMalchusDestinations },
		onOpen: remainStillOpen
	});
	const chesedAlpha = chochmahSearch.load('old');
	yesodAlias.value.identity.aliasId = 'beta';
	const gevurahBeta = chochmahSearch.load('new');
	netzachLoads.get('alpha').resolve([{ heichelId: 'old' }]);
	assert.deepEqual(await chesedAlpha, []);
	assert.deepEqual(malchusRendered, []);
	netzachLoads.get('beta').resolve([{ heichelId: 'new' }]);
	await gevurahBeta;
	assert.equal(malchusRendered[0][0].heichelId, 'new');
}

/** Proves stale channel detail cannot render or hydrate child surfaces after alias transition. */
async function proveYesodChannelRejectsOldAlias() {
	const yesodAlias = createYesodAliasState();
	const netzachLoads = new Map();
	const malchusDetails = [];
	let hodHydrations = 0;
	function revealBinahDetail(yesodAliasId) {
		const netzachDeferred = new NetzachDeferred();
		netzachLoads.set(yesodAliasId, netzachDeferred);
		return netzachDeferred.promise;
	}
	function manifestMalchusDetail(binahDetail) {
		malchusDetails.push(binahDetail);
	}
	function hydrateHodSurface() {
		hodHydrations += 1;
	}
	function remainStillMessage() {}
	const yesodChannels = new SpacesChannelCoordinator({
		state: yesodAlias.state,
		api: { destinationApi: { detail: revealBinahDetail } },
		view: { message: remainStillMessage, detail: manifestMalchusDetail },
		activity: { load: hydrateHodSurface },
		members: { load: hydrateHodSurface },
		review: { load: hydrateHodSurface }
	});
	const chesedAlpha = yesodChannels.open('old', 'root', { writeHistory: false });
	yesodAlias.value.identity.aliasId = 'beta';
	netzachLoads.get('alpha').resolve({ heichel: { heichelId: 'old' }, series: { seriesId: 'root' } });
	assert.equal(await chesedAlpha, null);
	assert.deepEqual(malchusDetails, []);
	assert.equal(hodHydrations, 0);
}

test('stale Spaces discovery cannot repaint a newer alias', proveChochmahSearchRejectsOldAlias);
test('stale Spaces channel cannot hydrate a newer alias', proveYesodChannelRejectsOldAlias);
