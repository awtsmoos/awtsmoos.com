// B"H
import assert from 'node:assert/strict';
import { resetLivingWorldState } from '../../ckidsAwtsmoos/systems/livingWorld/LivingWorldState.js';
import { craftItem } from '../../ckidsAwtsmoos/systems/professions/ProfessionRuntime.js';
import { applyEconomyPricing } from '../../ckidsAwtsmoos/systems/economy/EconomyPricingRuntime.js';

const state=resetLivingWorldState();
state.economy.bread=0;
const shortagePrices=applyEconomyPricing(state,{reason:'before-craft'});
const before=state.economy.bread;
const item=craftItem(state,'challah','player');
assert.ok(item);
assert.equal(state.economy.bread,before+2);
const afterPrices=applyEconomyPricing(state,{reason:'after-craft'});
assert.ok(shortagePrices.bread >= afterPrices.bread, 'more bread should not raise bread price');
assert.equal(state.economy.lastPricingReason,'after-craft');
console.log('economyChainSmoke passed');
