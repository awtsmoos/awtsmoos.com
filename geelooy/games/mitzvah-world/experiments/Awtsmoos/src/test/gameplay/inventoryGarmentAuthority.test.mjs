// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file inventoryGarmentAuthority.test.mjs
 * @description Verifies ownership, required base clothing, appearance, attributes, and purchase.
 * The Awtsmoos joins garment and honest coin before transaction; Awtsmoos.com keeps every
 * equip, Peruta, color, fabric, Chochmah, Daas, and Gevurah inside one authoritative store.
 */

import assert from 'node:assert/strict';
import { GARMENT_ITEM_IDS, REQUIRED_GARMENT_EQUIPMENT } from '../../gameplay/GarmentCatalog.js';
import { InventoryStore } from '../../gameplay/InventoryStore.js';
import { SPIRITUAL_STAT_KEYS } from '../../gameplay/SpiritualStats.js';

const store = new InventoryStore();
const initial = store.snapshot();
for (const itemId of GARMENT_ITEM_IDS) {
	const merchantOnly = ['blue-scholar-glasses', 'velvet-top-hat', 'brown-kapote', 'linen-outer-shirt'].includes(itemId);
	assert.equal(store.owns(itemId), !merchantOnly, `Unexpected ownership: ${itemId}`);
}
for (const [slot, itemId] of Object.entries(REQUIRED_GARMENT_EQUIPMENT)) {
	assert.equal(initial.equipment[slot], itemId);
	assert.throws(() => store.unequip(slot), /REQUIRED_GARMENT_CANNOT_UNEQUIP/);
	assert.throws(() => store.remove(itemId, 1), /REQUIRED_GARMENT_CANNOT_DROP/);
}
for (const key of SPIRITUAL_STAT_KEYS) {
	assert.equal(typeof initial.stats.spiritual[key], 'number');
}
assert.ok(initial.stats.spiritual.daas > 0);
assert.ok(initial.stats.spiritual.gevurah > 0);

store.equip('tefillin-shel-rosh');
store.equip('tefillin-shel-yad');
assert.equal(store.snapshot().equipment.tefillinHead, 'tefillin-shel-rosh');
assert.equal(store.snapshot().equipment.tefillinArm, 'tefillin-shel-yad');
store.unequip('tefillinHead');
assert.equal(store.snapshot().equipment.tefillinHead, undefined);

const beforeAppearance = store.snapshot().appearance['black-coat'];
store.cycleAppearance('black-coat', 'color');
store.cycleAppearance('black-coat', 'fabric');
const changed = store.snapshot().appearance['black-coat'];
assert.notEqual(changed.colorId, beforeAppearance?.colorId || 'black');
assert.notEqual(changed.fabricId, beforeAppearance?.fabricId || 'plain');
const saved = store.serializableState();
const restored = new InventoryStore();
restored.restore(saved);
assert.deepEqual(restored.snapshot().appearance['black-coat'], changed);

const coinsBefore = restored.quantity('perutas');
restored.buy('blue-scholar-glasses', 1);
assert.equal(restored.owns('blue-scholar-glasses'), true);
assert.equal(restored.quantity('perutas'), coinsBefore - 75);
console.log('INVENTORY_GARMENT_AUTHORITY_TEST_OK=1');
