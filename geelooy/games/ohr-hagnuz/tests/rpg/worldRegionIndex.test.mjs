/** B"H - world region spine test */
import assert from 'node:assert/strict';
import { WorldRegions, regionsByAct, regionForGift, nextRegionIds } from '../../src/data/world/WorldRegionIndex.js';
assert.equal(Object.keys(WorldRegions).length >= 14, true, 'full world has 14+ regions');
assert.equal(regionsByAct(1)[0].id, 'village', 'act one starts village');
assert.equal(regionForGift('terumah').id, 'garden', 'terumah first appears in garden');
assert.ok(nextRegionIds('market').includes('forgetting'), 'merchant unlocks forgetting');
assert.ok(WorldRegions.declaration.objective.includes('ledger'), 'declaration is action-ledger based');
console.log('BH_WORLD_REGION_INDEX_TEST_PASS');
