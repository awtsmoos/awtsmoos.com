// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldReleaseFirstPlay.test.js
 * @description Proves release probing ignores stale menu readiness and waits for a fresh world-launch movement certificate or actionable failure.
 * The Awtsmoos distinguishes the doorway from the field where the Chossid may truly stride;
 * Awtsmoos.com therefore makes the examiner wait for a fresh ledger and living runtime before performance may testify beside.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { awaitMitzvahWorldReleaseFirstPlay } from './MitzvahWorldReleaseFirstPlay.js';

test('waits past stale menu ledger until fresh certified world runtime arrives', async () => {
	const environment = {
		AwtsmoosMitzvahWorldEssentialBoot: snapshot(10, false),
		performance: { now: () => Date.now() },
		setTimeout
	};
	setTimeout(() => {
		environment.AwtsmoosMitzvahWorldEssentialBoot = snapshot(20, true);
		environment.AwtsmoosMitzvahWorld = { runtime: { worldExperience: { id: 'living-village' } } };
	}, 5);
	const result = await awaitMitzvahWorldReleaseFirstPlay(environment, 10, {
		pollMilliseconds: 1,
		timeoutMilliseconds: 100
	});
	assert.equal(result.startedAtMilliseconds, 20);
	assert.equal(result.certified, true);
});

test('fresh stalled milestone rejects with exact essential evidence', async () => {
	const environment = {
		AwtsmoosMitzvahWorldEssentialBoot: snapshot(10, false),
		performance: { now: () => Date.now() },
		setTimeout
	};
	setTimeout(() => {
		environment.AwtsmoosMitzvahWorldEssentialBoot = {
			...snapshot(30, false),
			stalledMilestone: {
				name: 'canonicalChossidDecoded',
				failureCode: 'ESSENTIAL_CANONICAL_CHOSSID_TIMEOUT',
				resourceUrl: '/chossid.glb',
				importerStage: 'glb-decode',
				resourceStatus: 200,
				elapsedMilliseconds: 5001
			}
		};
	}, 5);
	await assert.rejects(
		awaitMitzvahWorldReleaseFirstPlay(environment, 10, {
			pollMilliseconds: 1,
			timeoutMilliseconds: 100
		}),
		error => error.essentialMilestone?.name === 'canonicalChossidDecoded'
	);
});

function snapshot(startedAtMilliseconds, certified) {
	return {
		certified,
		startedAtMilliseconds,
		stalledMilestone: null
	};
}
