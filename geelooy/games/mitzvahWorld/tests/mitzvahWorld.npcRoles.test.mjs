// B"H
/**
 * Chapter 21: The Exclamation Mark Descends.
 */

import assert from 'node:assert/strict';
import { ensureNpcRoles } from '../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/postbuild/NpcRolePostBuild.js';

function makeScene(children) {
  return { traverse(fn) { children.forEach(fn); } };
}

const yosei = { name: 'npc_reb_yosei', userData: {}, nivraAwtsmoos: { id: 'npc_reb_yosei' } };
const shlomo = { name: 'npc_reb_shlomo', userData: {}, nivraAwtsmoos: { id: 'npc_reb_shlomo' } };
const plain = { name: 'plain_tree', userData: {}, nivraAwtsmoos: {} };

const touched = await ensureNpcRoles({ scene: makeScene([yosei, shlomo, plain]) });
assert.equal(touched.length, 2);
assert.equal(yosei.userData.hasMission, true);
assert.equal(yosei.userData.missionId, 'gather_emerald_wood');
assert.equal(yosei.userData.markerGlyph, '!');
assert.equal(shlomo.userData.hasTorahDebate, true);
assert.equal(shlomo.userData.debateDeckId, 'chumash_bereishis_opening');
assert.equal(shlomo.userData.opensBattleDebate, true);
assert.equal(plain.userData.markerType, undefined);

console.log('B"H - NPC role postbuild runtime passed.');
