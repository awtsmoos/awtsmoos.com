/** B"H - Rambam map coverage */
import assert from 'node:assert/strict';
import { RambamGiftMaps, rambamMapIds } from '../../src/data/maps/RambamGiftMaps.js';
const required = ['Village_Beginnings','Rambam_Garden','Hall_Of_Separation','Levi_Road','Poor_Gate','Jerusalem_Ascent','Orchard_SevenSpecies','Rambam_RecipientCourt','Market_Of_Exchange','House_Of_Forgetting','Sea_Of_Fire','Final_Declaration','Hidden_Orchard','Ohr_HaGanuz_Realm'];
for (const id of required) assert.ok(RambamGiftMaps[id]?.length, `${id} exists`);
assert.equal(rambamMapIds().length >= required.length, true, 'map id list covers all regions');
assert.ok(RambamGiftMaps.Market_Of_Exchange.some(row => row.includes('נ')), 'merchant glyph exists');
assert.ok(RambamGiftMaps.Final_Declaration.some(row => row.includes('וידוי')), 'declaration map has vidui');
console.log('BH_RAMBAM_MAP_COVERAGE_TEST_PASS');
