/** B"H - Storage runtime bank/vault test. */
import assert from 'node:assert/strict';
import { State } from '../../src/binah/State.js';
import { addItem, ensureBag } from '../../src/yesod/bag/BagRuntime.js';
import { depositGarment, depositItem, depositMoney, ensureStorage, withdrawGarment, withdrawItem, withdrawMoney } from '../../src/yesod/storage/StorageRuntime.js';
import { createMemoryStorage } from '../../src/yesod/save/SaveStorage.js';
import { loadGame, saveGame } from '../../src/yesod/save/SaveRuntime.js';

State.Inventory = { money: 100, garments: ['WHITE_LINEN', 'GOLD_ROBE'], books: [], journal: { opened: true, notes: [] }, items: {} };
State.Equipment = { garment: 'WHITE_LINEN' };
State.Storage = null;
ensureBag();
addItem('spark', 8);
assert.equal(ensureStorage().money, 0);

assert.equal(depositMoney(40).ok, true);
assert.equal(State.Inventory.money, 60);
assert.equal(State.Storage.money, 40);
assert.equal(withdrawMoney(10).ok, true);
assert.equal(State.Inventory.money, 70);
assert.equal(State.Storage.money, 30);

assert.equal(depositItem('spark', 5).ok, true);
assert.equal(State.Inventory.items.spark, 3);
assert.equal(State.Storage.items.spark, 5);
assert.equal(withdrawItem('spark', 2).ok, true);
assert.equal(State.Inventory.items.spark, 5);
assert.equal(State.Storage.items.spark, 3);

assert.equal(depositGarment('WHITE_LINEN').ok, false, 'equipped garment cannot be stored');
assert.equal(depositGarment('GOLD_ROBE').ok, true);
assert.equal(State.Inventory.garments.includes('GOLD_ROBE'), false);
assert.equal(withdrawGarment('GOLD_ROBE').ok, true);
assert.equal(State.Inventory.garments.includes('GOLD_ROBE'), true);

const storage = createMemoryStorage();
depositMoney(20);
saveGame(storage);
State.Storage = null;
State.Inventory.money = 999;
const loaded = loadGame(storage);
assert.equal(loaded.ok, true);
assert.equal(State.Storage.money, 50);
assert.equal(State.Inventory.money, 50);
console.log('BH_STORAGE_RUNTIME_TEST_PASS');
