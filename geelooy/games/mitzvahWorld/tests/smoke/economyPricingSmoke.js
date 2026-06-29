// B"H
import assert from 'node:assert/strict';
import { calculateItemPrice, applyEconomyPricing, pricedVendorStock } from '../../ckidsAwtsmoos/systems/economy/EconomyPricingRuntime.js';
import { createVendorRuntime, openVendor } from '../../ckidsAwtsmoos/systems/social/VendorRuntime.js';

const shortage = { bread:1, candle:8, demand:{ bread:6, candle:3 }, prices:{ bread:5, candle:4 } };
const breadShortagePrice = calculateItemPrice(shortage, 'warm_bread');
const candleSurplusPrice = calculateItemPrice(shortage, 'candle');
assert.ok(breadShortagePrice > 5, 'bread shortage raises price');
assert.ok(candleSurplusPrice <= 4, 'candle surplus does not inflate price');
const store = { economy: shortage };
const prices = applyEconomyPricing(store, { reason:'smoke' });
assert.equal(prices.bread, breadShortagePrice, 'store prices update from shortage');
assert.equal(store.economy.lastPricingReason, 'smoke', 'pricing reason recorded');
const stock = pricedVendorStock([{ id:'warm_bread', name:'Warm Bread', price:5 }], store.economy);
assert.equal(stock[0].price, breadShortagePrice, 'vendor stock receives dynamic price');
const vendor = createVendorRuntime([{ id:'warm_bread', name:'Warm Bread', price:5 }], { economy:store.economy, reputation:100 });
const listed = vendor.list();
const bought = vendor.buy('warm_bread');
assert.ok(listed[0].price < breadShortagePrice, 'reputation discount affects list price');
assert.equal(bought.ok, true, 'buy succeeds when one bread remains');
assert.equal(bought.price, listed[0].price, 'buy uses dynamic listed price');
assert.equal(store.economy.bread, 0, 'buy decrements economy supply when economy context exists');
const empty = vendor.buy('warm_bread');
assert.equal(empty.ok, false, 'second buy fails after supply is gone');
const opened = openVendor('bakery', [{ id:'warm_bread', name:'Warm Bread', price:5 }], { economy:store.economy });
assert.equal(opened.stock[0].economyKey, 'bread', 'openVendor exposes economy key');
console.log('economyPricingSmoke passed');
