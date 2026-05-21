import assert from 'node:assert/strict';
import { InventoryStackRuntime } from '../ckidsAwtsmoos/Olam/runtime/inventory/InventoryStackRuntime.js';

const inventory = new InventoryStackRuntime();
inventory.add({ id: 'wood', name: 'Wood', category: 'resource' }, 2);
inventory.add({ id: 'wood', name: 'Wood', category: 'resource' }, 4);
inventory.add({ id: 'passage_shemos_20_2', name: 'Shemos 20:2', category: 'torah' }, 1);

assert.equal(inventory.count('wood'), 6);
assert.equal(inventory.listByCategory('resource')[0].amount, 6);
assert.equal(inventory.listByCategory('torah')[0].item.id, 'passage_shemos_20_2');
assert.throws(() => inventory.add({}), /item id is required/);

console.log('B"H inventory stack passed');
