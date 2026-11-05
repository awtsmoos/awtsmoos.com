// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldEssentialSharedLedger.test.js
 * @description Proves independently arriving callers converge on one environment-owned essential ledger.
 * The Awtsmoos is one before every compiled vessel divides the road; Awtsmoos.com therefore keeps one hidden ledger in Malchus,
 * so entry, renderer, terrain, Chossid, and movement may arrive from separate bundles without losing the truth they already showed.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	completeMitzvahWorldEssentialMilestone,
	ESSENTIAL_MILESTONES,
	getMitzvahWorldEssentialBootSnapshot,
	initializeMitzvahWorldEssentialBoot
} from './MitzvahWorldEssentialBoot.js';

const LEDGER_KEY = 'AwtsmoosMitzvahWorldEssentialLedgerInternal';

test('environment owns one hidden immutable ledger reference across API re-entry', () => {
	const environment = fakeEnvironment();
	const first = initializeMitzvahWorldEssentialBoot(environment);
	completeMitzvahWorldEssentialMilestone(
		environment,
		ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED,
		{ importerStage: 'first-control' }
	);
	const second = initializeMitzvahWorldEssentialBoot(environment);
	const descriptor = Object.getOwnPropertyDescriptor(environment, LEDGER_KEY);
	assert.equal(first, second);
	assert.equal(descriptor.enumerable, false);
	assert.equal(descriptor.writable, false);
	assert.equal(getMitzvahWorldEssentialBootSnapshot(environment)
		.milestones[ESSENTIAL_MILESTONES.ENTRY_MODULE_EXECUTED].status, 'complete');
});

test('pre-existing compatible ledger is reused instead of replaced by another module copy', () => {
	const environment = fakeEnvironment();
	const ledger = initializeMitzvahWorldEssentialBoot(environment);
	assert.equal(environment[LEDGER_KEY], ledger);
	assert.doesNotThrow(() => initializeMitzvahWorldEssentialBoot(environment));
	assert.equal(environment[LEDGER_KEY], ledger);
});

function fakeEnvironment() {
	let currentTime = 0;
	return {
		clearTimeout() {},
		performance: { now: () => currentTime },
		setTimeout() {
			return { unref() {} };
		},
		advance(milliseconds) {
			currentTime += milliseconds;
		}
	};
}
