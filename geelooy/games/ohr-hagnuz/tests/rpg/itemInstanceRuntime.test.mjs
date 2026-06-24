/** B"H - Item instance identity and persistence test. */
import assert from 'node:assert/strict';
import { State } from '../../src/binah/State.js';
import { createItemInstance, destroyItemInstance, getItemInstance, itemInstancesIn, moveItemInstance } from '../../src/yesod/items/ItemInstanceRuntime.js';
import { createMemoryStorage } from '../../src/yesod/save/SaveStorage.js';
import { loadGame, saveGame } from '../../src/yesod/save/SaveRuntime.js';

State.ItemInstances = null;
const made = createItemInstance('DRAGON_SCALE', { rarity: 'legendary', source: 'boss:test', metadata: { roll: 99 } });
assert.equal(made.ok, true);
assert.match(made.item.id, /^itm_/);
assert.equal(made.item.name, 'Dragon Scale');
assert.equal(made.item.rarity, 'legendary');
assert.equal(itemInstancesIn('bag').length, 1);

const moved = moveItemInstance(made.item.id, 'storage');
assert.equal(moved.ok, true);
assert.equal(getItemInstance(made.item.id).container, 'storage');
assert.equal(itemInstancesIn('bag').length, 0);
assert.equal(itemInstancesIn('storage').length, 1);

const storage = createMemoryStorage();
saveGame(storage);
State.ItemInstances = null;
const loaded = loadGame(storage);
assert.equal(loaded.ok, true);
assert.equal(itemInstancesIn('storage')[0].metadata.roll, 99);

assert.equal(destroyItemInstance(made.item.id).ok, true);
assert.equal(getItemInstance(made.item.id), null);
assert.equal(createItemInstance('NO_SUCH_ITEM').reason, 'unknown-definition');
console.log('BH_ITEM_INSTANCE_RUNTIME_TEST_PASS');
