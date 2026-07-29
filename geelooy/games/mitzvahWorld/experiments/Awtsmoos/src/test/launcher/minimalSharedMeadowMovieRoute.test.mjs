// B"H
// Boruch Hashem
// Blessed is He

/** @file minimalSharedMeadowMovieRoute.test.mjs @description Proves explicit creative-route injection bypasses gameplay boot. */
import assert from 'node:assert/strict';
import { bootMinimalSharedMeadow } from '../../launcher/MinimalSharedMeadowPage.js';
const elements = new Map();
const documentValue = {
	documentElement: { dataset: {} },
	getElementById(id) {
		if (!elements.has(id)) elements.set(id, { dataset: {}, id, textContent: '' });
		return elements.get(id);
	}
};
const environment = { location: { search: '?mode=movie&project=opening-scene' } };
const diagnostics = { kind: 'movie-studio', project: 'opening-scene' };
let movieCalls = 0;
const result = await bootMinimalSharedMeadow(documentValue, environment, {
	async openCreativeRoute(hosts, search) {
		movieCalls += 1;
		assert.equal(hosts.canvas.id, 'AwtsmoosCanvas');
		assert.equal(search, '?mode=movie&project=opening-scene');
		return { handled: true, value: diagnostics };
	}
});
assert.equal(result, diagnostics);
assert.equal(environment.AwtsmoosMitzvahWorld, diagnostics);
assert.equal(movieCalls, 1);
assert.equal(documentValue.documentElement.dataset.awtsmoosBootStage, 'creative-ready');
assert.equal(documentValue.documentElement.dataset.awtsmoosSession, 'movie');
console.log('minimal shared meadow opens the explicit Movie route');
