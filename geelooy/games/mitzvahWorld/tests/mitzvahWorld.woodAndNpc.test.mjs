import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { collectWoodRuntime } from '../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/collectibles/WoodCollectionLogic.js';
import { ensureNpcRoles } from '../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/postbuild/NpcRolePostBuild.js';

const source = await fs.readFile(new URL('../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/postbuild/MitzvahWorldPostBuild.js', import.meta.url), 'utf8');
assert.equal(source.includes('ensureNpcRoles'), true);
assert.equal(source.includes('NPC_ROLES'), true);
assert.equal(source.includes('roleMarkedNpcs'), true);

const actor = {
  inventory: { addItem() {} },
  updateQuestProgress(type, item) { actor.progress = `${type}:${item}`; }
};
const group = { visible: true, userData: {} };
collectWoodRuntime({ actor, group, amount: 2, collectibleId: 'wood_1' });
assert.equal(actor.progress, 'collect:Wood');
assert.equal(group.visible, false);
assert.equal(group.userData.collected, true);

const npc = { name: 'npc_reb_shlomo', userData: {} };
const marked = ensureNpcRoles({ scene: { traverse(fn) { fn(npc); } } });
assert.equal(marked.length, 1);
assert.equal(npc.userData.debateDeckId, 'chumash_bereishis_opening');
console.log('B"H wood and npc runtime passed');
