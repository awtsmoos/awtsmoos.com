/** B"H - unified shop buying, selling, and mission event behavior. */
import assert from 'node:assert/strict';

global.window = { AwtsmoosIntents: { U:0,D:0,L:0,R:0,A:0,B:0 } };
const { State } = await import('../binah/State.js');
const { openShop, buyItem, sellItem } = await import('../yesod/economy/ShopRuntime.js');
State.Inventory.money = 30;
assert.equal(openShop('village_general'), true);
assert.equal(buyItem('tea').ok, true);
assert.equal(State.Inventory.items.tea, 1);
assert.equal(State.Inventory.money, 22);
State.Inventory.items.scroll = 1;
assert.equal(sellItem('scroll').ok, true);
assert.equal(State.Inventory.items.scroll, 0);
assert.equal(State.Inventory.money, 27);
assert.equal(State.Economy.transactions.length, 2);
console.log('BH_ECONOMY_FLOW_TEST_PASS');
