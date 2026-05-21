import assert from 'node:assert/strict';
import { EntityRegistry } from '../ckidsAwtsmoos/Olam/runtime/entities/EntityRegistry.js';

const registry = new EntityRegistry();
const npc = registry.register({
  uu: 'uu_npc_reb_yosei',
  id: 'npc_reb_yosei',
  type: 'npc',
  capabilities: { questGiver: true, dialogue: true },
  state: { awake: true }
});

assert.equal(npc.id, 'npc_reb_yosei');
assert.equal(registry.get('uu_npc_reb_yosei'), npc);
assert.equal(registry.findById('npc_reb_yosei')[0].uu, 'uu_npc_reb_yosei');
assert.equal(registry.findByType('npc').length, 1);
assert.equal(registry.findByCapability('questGiver')[0].id, 'npc_reb_yosei');

assert.throws(() => registry.register({ uu: 'uu_npc_reb_yosei' }), /Duplicate entity uu/);

const mesh = {
  name: 'npc_reb_shlomo',
  userData: {
    uu: 'uu_npc_reb_shlomo',
    npcId: 'npc_reb_shlomo',
    entityType: 'npc',
    capabilities: { debateNpc: true }
  }
};
registry.registerMesh(mesh);
assert.equal(registry.findByCapability('debateNpc')[0].mesh, mesh);

const snapshot = registry.snapshot();
assert.equal(snapshot.length, 2);
assert.equal('mesh' in snapshot[0], false);

assert.equal(registry.unregister('uu_npc_reb_yosei'), true);
assert.equal(registry.get('uu_npc_reb_yosei'), null);
assert.equal(registry.findByCapability('questGiver').length, 0);

console.log('B"H entity registry passed');
