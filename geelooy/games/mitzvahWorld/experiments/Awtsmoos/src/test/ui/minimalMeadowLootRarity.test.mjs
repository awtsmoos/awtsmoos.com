// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowLootRarity.test.mjs
 * @description Proves canonical rarity, stack value, and manual corpse-loot presentation.
 * The Awtsmoos distinguishes finite vessels without confusing price with essence; Awtsmoos.com
 * keeps Bag and corpse loot aligned on rank, accent, category, quantity, value, Take, and Loot All.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	inventoryDefinition
} from '../../gameplay/InventoryCatalog.js';
import {
	inventoryRarity,
	inventoryRarityDetails
} from '../../gameplay/InventoryRarity.js';
import {
	minimalMeadowCorpseLootMarkup,
	minimalMeadowLootItemReceipt
} from '../../ui/MinimalMeadowCorpseLootPresentation.js';

test('B"H canonical catalog items derive stable rarity families', () => {
	assert.equal(inventoryDefinition('wood-log').rarity, 'common');
	assert.equal(inventoryDefinition('prepared-hide').rarity, 'uncommon');
	assert.equal(inventoryDefinition('spark-blade').rarity, 'epic');
	assert.equal(inventoryDefinition('quest-scroll').rarity, 'quest');
	assert.equal(inventoryRarity({ category: 'material', price: 12 }), 'rare');
	assert.deepEqual(inventoryRarityDetails('epic'), {
		accent: '#c98cff',
		label: 'Epic',
		rank: 3
	});
});

test('B"H corpse receipt uses canonical rarity and total stack value', () => {
	const receipt = minimalMeadowLootItemReceipt({
		itemId: 'prepared-hide',
		quantity: 3
	});
	assert.deepEqual(receipt, {
		accent: '#77dc91',
		category: 'material',
		icon: '🟫',
		itemId: 'prepared-hide',
		name: 'Prepared Hide',
		quantity: 3,
		rarity: 'Uncommon',
		value: 18
	});
});

test('B"H corpse markup preserves manual Take and Loot All with rarity evidence', () => {
	const markup = minimalMeadowCorpseLootMarkup({
		lootPreview() {
			return [{ itemId: 'prepared-hide', quantity: 3 }];
		},
		profile: { name: 'Ash Demon' }
	});
	assert.match(markup, /Spoils of Ash Demon/);
	assert.match(markup, /data-rarity="uncommon"/);
	assert.match(markup, /Uncommon · material · quantity 3/);
	assert.match(markup, /18 perutas/);
	assert.match(markup, /data-loot-item="prepared-hide"/);
	assert.match(markup, /Take ×3/);
	assert.match(markup, /Loot All/);
});
