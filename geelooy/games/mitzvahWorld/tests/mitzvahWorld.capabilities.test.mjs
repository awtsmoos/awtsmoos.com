import assert from 'node:assert/strict';
import { EntityRegistry } from '../ckidsAwtsmoos/Olam/runtime/entities/EntityRegistry.js';
import { CapabilityRegistry } from '../ckidsAwtsmoos/Olam/runtime/capabilities/CapabilityRegistry.js';
import { entitiesWithCapability, hasCapability, summarizeCapabilities } from '../ckidsAwtsmoos/Olam/runtime/capabilities/CapabilityQueries.js';

const entities = new EntityRegistry();
const capabilities = new CapabilityRegistry();

const questNpc = entities.register({ uu: 'uu_yosei', id: 'npc_reb_yosei', type: 'npc', capabilities: { questGiver: true } });
entities.register({ uu: 'uu_shlomo', id: 'npc_reb_shlomo', type: 'npc', capabilities: { debateNpc: true, dialogue: true } });

capabilities.register('questGiver', (record, payload) => ({ missionId: payload.missionId, npcId: record.id }));
assert.equal(capabilities.has('questGiver'), true);
assert.deepEqual(capabilities.dispatch('questGiver', questNpc, { missionId: 'gather_emerald_wood' }), {
  missionId: 'gather_emerald_wood',
  npcId: 'npc_reb_yosei'
});
assert.throws(() => capabilities.dispatch('questGiver', entities.get('uu_shlomo')), /lacks capability/);
assert.equal(entitiesWithCapability(entities, 'debateNpc')[0].id, 'npc_reb_shlomo');
assert.equal(hasCapability(questNpc, 'questGiver'), true);
assert.deepEqual(summarizeCapabilities(entities.snapshot()), { questGiver: 1, debateNpc: 1, dialogue: 1 });

console.log('B"H capability registry passed');
