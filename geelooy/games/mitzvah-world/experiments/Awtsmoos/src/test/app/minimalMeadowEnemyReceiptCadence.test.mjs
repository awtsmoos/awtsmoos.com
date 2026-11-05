// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowEnemyReceiptCadence.test.mjs
 * @description Proves diagnostic snapshots refresh at four hertz without slowing actor updates.
 * The Awtsmoos renews the living actor before the witness needs another written page;
 * Awtsmoos.com keeps diagnostics bounded while combat remains immediate at every age.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowEnemyReceiptCadence } from '../../app/MinimalMeadowEnemyReceiptCadence.js';

test('enemy receipts remain stable between four-hertz refresh windows', () => {
	const actor = createActor();
	const cadence = new MinimalMeadowEnemyReceiptCadence([actor]);
	const initial = cadence.receipts;
	actor.health = 75;
	assert.equal(cadence.update(0.1), initial);
	assert.equal(cadence.update(0.1), initial);
	const refreshed = cadence.update(0.05);
	assert.notEqual(refreshed, initial);
	assert.equal(refreshed[0].health, 75);
	assert.equal(cadence.diagnostics().refreshes, 2);
});

test('explicit diagnostics refresh publishes current state immediately', () => {
	const actor = createActor();
	const cadence = new MinimalMeadowEnemyReceiptCadence([actor]);
	actor.alive = false;
	const refreshed = cadence.refresh();
	assert.equal(refreshed[0].alive, false);
	assert.equal(cadence.diagnostics().intervalSeconds, 0.25);
});

function createActor() {
	return {
		alive: true,
		group: {
			position: { x: 1, y: 2, z: 3 },
			userData: {},
			visible: true
		},
		health: 96,
		lootState: { snapshot: () => [] },
		looted: false,
		payload() {
			return {
				alive: this.alive,
				health: this.health,
				id: 'proof-enemy',
				looted: this.looted
			};
		},
		profile: { id: 'proof-enemy' }
	};
}
