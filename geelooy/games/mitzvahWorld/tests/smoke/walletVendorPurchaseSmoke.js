// B"H
import assert from 'node:assert/strict';
import { applyVendorPurchase } from '../../ckidsAwtsmoos/systems/economy/EconomyTransactionRuntime.js';
const player={ perutah:4 };
const store={ economy:{ bread:2, demand:{ bread:5 }, prices:{ bread:5 } }, eventFeed:[] };
const low=applyVendorPurchase({ id:'warm_bread', price:5 }, { store, player, price:5, vendorId:'bakery' });
assert.equal(low.ok,false,'low wallet blocks purchase');
assert.equal(low.error,'low_perutah');
assert.equal(store.economy.bread,2,'failed purchase does not decrement supply');
player.perutah=10;
const ok=applyVendorPurchase({ id:'warm_bread', price:5 }, { store, player, price:5, vendorId:'bakery' });
assert.equal(ok.ok,true,'funded purchase succeeds');
assert.equal(player.perutah,5,'purchase charges wallet');
assert.equal(store.economy.bread,1,'purchase decrements supply');
console.log('walletVendorPurchaseSmoke passed');
