// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InventoryModalCombatBoundary.test.mjs
 * @description Proves action-bar activation remains silent until the Bag releases world interaction.
 * The Awtsmoos grants every deed its proper moment;
 * Awtsmoos.com prevents combat intent beneath the modal and restores it immediately after close.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { isInventoryModalOpen } from '../../ui/InventoryModalState.js';
import { MinimalMeadowCombatBar } from '../../ui/MinimalMeadowCombatBar.js';

test('combat activation is suspended while Bag modal state is open', () => {
	const emitted = [];
	const documentValue = {
		documentElement: {
			dataset: { inventoryModalOpen: 'true' }
		}
	};
	const bar = Object.create(MinimalMeadowCombatBar.prototype);
	bar.host = { ownerDocument: documentValue };
	bar.bus = { emit: (name, detail) => emitted.push({ detail, name }) };
	assert.equal(isInventoryModalOpen(documentValue), true);
	bar.activate('aleph-strike');
	assert.deepEqual(emitted, []);
	documentValue.documentElement.dataset.inventoryModalOpen = 'false';
	bar.activate('aleph-strike');
	assert.deepEqual(emitted, [{
		detail: { actionId: 'aleph-strike', source: 'action-bar' },
		name: 'combat:activate'
	}]);
});
