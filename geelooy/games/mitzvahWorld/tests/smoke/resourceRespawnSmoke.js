// B"H
import assert from 'node:assert/strict';
import { applyResourceRespawn } from '../../ckidsAwtsmoos/systems/world/ResourceRespawnRuntime.js';
const store={ clockHour:1, economy:{ grain:0, flour:0, wood:0, wax:0, paper:0, ink:0, charity:0 } };
const out=applyResourceRespawn(store,4);
assert.equal(out.elapsed,3,'elapsed hours tracked');
assert.equal(store.economy.grain,3,'grain respawns by hour');
assert.equal(store.economy.flour,3,'flour respawns by hour');
const capped=applyResourceRespawn(store,20);
assert.ok(store.economy.grain<=8,'grain cap respected');
assert.ok(capped.gains.grain>=0,'gain row returned');
console.log('resourceRespawnSmoke passed');
