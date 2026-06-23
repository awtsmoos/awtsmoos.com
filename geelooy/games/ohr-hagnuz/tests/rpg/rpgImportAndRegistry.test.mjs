/** B"H - RPG import and registry verification */
import assert from 'node:assert/strict';
import { allMusagSpecies, musagEvolutionPairs } from '../../src/data/concepts/MusagSpecies.js';
import { EncounterIndex, WildEncounterIds, randomWildEncounter, wildIdsForRegion } from '../../src/data/EncounterIndex.js';
import { RambamQuests } from '../../src/data/QuestIndexRambam.js';
import { SkillIds, skillSummary } from '../../src/yesod/skills/SkillRuntime.js';
import { declarationTruthReport } from '../../src/yesod/rambam/DeclarationRuntime.js';

assert.equal(allMusagSpecies().length >= 50, true, 'at least 50 Musag species');
assert.equal(musagEvolutionPairs().length >= 20, true, 'many evolution pairs');
assert.equal(WildEncounterIds.length >= 50, true, 'all Musag species exposed as wild encounters');
assert.ok(EncounterIndex.wild_helem, 'wild helem encounter exists');
assert.ok(randomWildEncounter('Poor Gate').region === 'Poor Gate', 'region encounter filtering works');
assert.equal(wildIdsForRegion('Jerusalem Ascent').length > 0, true, 'Jerusalem has wild encounters');
assert.equal(Object.keys(RambamQuests).length >= 10, true, 'Rambam quest chain is concrete');
assert.equal(SkillIds.length, 12, '12 skills');
assert.equal(skillSummary().length, 12, 'skill summary has 12 rows');
assert.equal(declarationTruthReport().ready, false, 'fresh declaration not ready');
console.log('BH_RPG_IMPORT_REGISTRY_TEST_PASS');
