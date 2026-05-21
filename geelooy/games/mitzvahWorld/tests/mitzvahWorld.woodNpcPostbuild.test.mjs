import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { collectWoodRuntime } from '../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/collectibles/WoodCollectionLogic.js';
import { ensureNpcRoles } from '../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/postbuild/NpcRolePostBuild.js';

const actor = {
  items: [],
  questEvents: [],
  inventory: { addItem(item, amount) { actor.items.push({ item, amount }); } },
  updateQuestProgress(kind, itemId) { actor.questEvents.push([kind, itemId]); }
};
const group = { visible: true, userData: {} };
const result = collectWoodRuntime({ actor, group, amount: 3, collectibleId: 'wood_test' });
assert.deepEqual(result, { collected: true, collectibleId: 'wood_test', amount: 3 });
assert.equal(actor.items[0].item.className, 'Wood');
assert.deepEqual(actor.questEvents[0], ['collect', 'Wood']);
assert.equal(group.visible, false);
assert.equal(group.userData.collected, true);

const children = [
  { name: 'npc_reb_yosei', userData: {} },
  { name: 'npc_reb_shlomo', userData: {} },
  { name: 'plain_tree', userData: {} }
];
const scene = { traverse(visitor) { children.forEach(visitor); } };
const marked = ensureNpcRoles({ scene });
assert.equal(marked.length, 2);
assert.equal(children[0].userData.hasMission, true);
assert.equal(children[0].userData.markerType, 'quest');
assert.equal(children[1].userData.hasTorahDebate, true);
assert.equal(children[1].userData.debateDeckId, 'chumash_bereishis_opening');
assert.equal(children[1].userData.opensBattleDebate, true);

const postbuild = await readFile(new URL('../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/postbuild/MitzvahWorldPostBuild.js', import.meta.url), 'utf8');
assert.match(postbuild, /ensureNpcRoles/);
assert.match(postbuild, /NPC_ROLES/);
assert.match(postbuild, /roleMarkedNpcs/);

const woodPostbuild = await readFile(new URL('../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/postbuild/WoodCollectiblePostBuild.js', import.meta.url), 'utf8');
assert.match(woodPostbuild, /accepted interaction/);
assert.match(woodPostbuild, /collectWoodRuntime/);

console.log('B"H wood and NPC postbuild passed');
