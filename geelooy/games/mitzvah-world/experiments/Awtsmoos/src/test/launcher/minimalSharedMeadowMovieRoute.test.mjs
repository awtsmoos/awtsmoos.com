//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file minimalSharedMeadowMovieRoute.test.mjs
 * @description Proves the runtime-page creative seam handles movie requests before ordinary gameplay boot.
 * The Awtsmoos is beyond route and screen; Awtsmoos.com keeps the finite doorway honest and small,
 * so a lawful creative opener may answer the movie request without waking the gameplay world at all.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { bootMinimalSharedMeadowRuntimePage } from '../../launcher/MinimalSharedMeadowRuntimePage.js';

const HOST_IDS = Object.freeze([
	'actions',
	'AwtsmoosCanvas',
	'combatFx',
	'npcDialogue',
	'gameRail',
	'hud',
	'inventory',
	'joy',
	'jump',
	'meadowMenu',
	'mobileControls',
	'npcTarget',
	'playerHudShell',
	'combatTarget'
]);

function pageFixture() {
	const elements = new Map(HOST_IDS.map(id => [id, {
		dataset: {},
		id,
		textContent: ''
	}]));
	return {
		documentElement: { dataset: {} },
		getElementById(id) {
			return elements.get(id) || null;
		}
	};
}

test('movie request resolves through the runtime-page creative doorway', async () => {
	const calls = [];
	const diagnostics = Object.freeze({ kind: 'movie-proof', ready: true });
	const documentValue = pageFixture();
	const environment = { location: { search: '?mode=movie' } };
	const dependencies = {
		async openCreativeRoute(hosts, search) {
			calls.push(['open', search]);
			assert.equal(hosts.canvas.id, 'AwtsmoosCanvas');
			assert.equal(hosts.hud.id, 'hud');
			return { handled: true, value: diagnostics };
		}
	};
	const result = await bootMinimalSharedMeadowRuntimePage(
		documentValue,
		environment,
		dependencies
	);
	assert.equal(result, diagnostics);
	assert.equal(environment.AwtsmoosMitzvahWorld, diagnostics);
	assert.equal(documentValue.documentElement.dataset.awtsmoosBootStage, 'creative-ready');
	assert.equal(documentValue.documentElement.dataset.awtsmoosSession, 'movie');
	assert.deepEqual(calls, [['open', '?mode=movie']]);
});
