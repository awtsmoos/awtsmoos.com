// B"H
import assert from 'node:assert/strict';
import { createWorldEventRuntime } from '../../ckidsAwtsmoos/systems/world/WorldEventRuntime.js';
const store={ economy:{ bread:5, candle:2 }, villageProjects:{} };
const world=createWorldEventRuntime(store);
for(let i=0;i<23;i++) world.ambient('smoke');
assert.ok(store.eventFeed.length>=20);
assert.ok('farmerSick' in store.villageProjects || store.economy.bread<=1 || store.economy.candle<=1);
console.log('ambientEventSpawnerSmoke passed');
