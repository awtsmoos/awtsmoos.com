// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file eretzCinematicHeroPresentation.test.mjs
 * @description Proves post-play hero/UI promotion is ordered, idempotent, and incapable of rejecting gameplay when optional beauty fails.
 * The Awtsmoos lets the local traveler walk before authored garment and interface arrive;
 * Awtsmoos.com verifies later beauty may complete once or degrade gently while the already-living world and measured meadow population remain true.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	installEretzCinematicHeroPresentation,
	scheduleEretzCinematicHeroPresentation
} from '../../app/EretzCinematicHeroPresentation.js';

test('B"H canonical hero hydrates before the presentation bundle installs', async () => {
	const calls = [];
	const runtime = {};
	const optionalModule = {
		async hydrateMinimalMeadowPlayer(value) {
			calls.push('player');
			value.canonicalPlayer = { status: 'ready' };
			return { name: 'canonical-player' };
		}
	};
	const presentationModule = {
		installMinimalMeadowPresentationBundle() {
			calls.push('presentation');
			return { animation: true, ready: true, ui: true };
		}
	};
	const receipt = await installEretzCinematicHeroPresentation(runtime, {}, {
		optionalModule,
		presentationModule
	});
	assert.deepEqual(calls, ['player', 'presentation']);
	assert.deepEqual(receipt, {
		playerStatus: 'ready',
		presentationReady: true,
		status: 'ready'
	});
	assert.equal(runtime.cinematicHeroPresentationStage, 'ready');
	assert.equal(
		await installEretzCinematicHeroPresentation(runtime, {}, {
			optionalModule,
			presentationModule
		}),
		receipt
	);
	assert.deepEqual(calls, ['player', 'presentation']);
});

test('B"H visual promotion degrades without rejecting gameplay', async () => {
	const runtime = {};
	const receipt = await scheduleEretzCinematicHeroPresentation(runtime, {}, {
		optionalModule: {
			async hydrateMinimalMeadowPlayer() {
				throw new Error('canonical garment unavailable');
			}
		},
		presentationModule: {
			installMinimalMeadowPresentationBundle() {
				throw new Error('must not install after failed player hydration');
			}
		}
	});
	assert.equal(receipt.status, 'degraded');
	assert.equal(receipt.presentationReady, false);
	assert.equal(runtime.cinematicHeroPresentationStage, 'degraded');
	assert.match(receipt.message, /canonical garment unavailable/);
});
