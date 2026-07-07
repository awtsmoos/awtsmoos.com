// B\"H
import assert from 'node:assert/strict';
import { createInventoryLazyHydration } from '../../ckidsAwtsmoos/Olam/equipment/runtime/InventoryLazyHydration.js';

const inventory = createInventoryLazyHydration([{ id: 'wood-sword', name: 'Wood Sword', icon: 'sword', value: 7 }]);
assert.deepEqual(inventory.minimalList(), [{ id: 'wood-sword', name: 'Wood Sword', icon: 'sword', value: 7 }]);
assert.equal(inventory.canSell('wood-sword'), true);
assert.equal(inventory.hydrate('wood-sword', { damage: 3 }).hydrated, true);
assert.deepEqual(inventory.sellableIds(), ['wood-sword']);
console.log('B\"H inventoryLazyHydrationSmoke passed');
