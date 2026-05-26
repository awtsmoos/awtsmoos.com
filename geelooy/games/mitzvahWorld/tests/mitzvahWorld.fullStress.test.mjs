// B"H
/**
 * Full independent stress suite for Emerald Void / MitzvahWorld.
 *
 * This suite imports runtime-pure controllers and helpers directly, exercises
 * edge cases, validates manifest invariants, awaits async postbuild logic, and
 * prints a precise pass ledger.
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

import { TorahDebateController } from '../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/debate/TorahDebateController.js';
import { ChumashReaderController } from '../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/debate/ChumashReaderController.js';
import { ResponsiveActionDispatcher } from '../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/mobile/ResponsiveActionDispatcher.js';
import { ensureNpcRoles } from '../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/postbuild/NpcRolePostBuild.js';
import { collectWoodRuntime } from '../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/collectibles/WoodCollectionLogic.js';
import { STARTING_CHUMASH_ITEM, CHUMASH_PASSAGES } from '../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/data/manifests/ChumashPassages.js';
import { TORAH_DEBATE_TYPES, resolveDebateType } from '../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/data/debate/TorahDebateRules.js';
import { TORAH_DEBATE_DECKS } from '../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/data/debate/TorahDebateDecks.js';
import { EMERALD_WOOD_NODES } from '../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/data/collectibles/WoodCollectibles.js';

const cwdGameRoot = path.resolve('.');
const repoGameRoot = path.resolve('geelooy/games/mitzvahWorld');
const repoRoot = fs.existsSync(path.join(cwdGameRoot, 'index.js')) ? cwdGameRoot : repoGameRoot;
const worldRoot = path.join(repoRoot, 'ckidsAwtsmoos/Olam/worlds/mitzvahWorld');
const results = [];

async function record(name, fn) {
  try {
    const detail = await fn();
    results.push({ name, ok: true, detail: detail || 'passed' });
  } catch (error) {
    results.push({ name, ok: false, detail: error.message });
  }
}

function makeScene(children) {
  return { traverse(fn) { children.forEach(fn); } };
}

await record('PaRDeS rule table is complete and cyclic', () => {
  assert.deepEqual(Object.keys(TORAH_DEBATE_TYPES).sort(), ['derush', 'pshat', 'remez', 'sod']);
  assert.equal(resolveDebateType('pshat', 'sod'), 'strong');
  assert.equal(resolveDebateType('remez', 'derush'), 'strong');
  assert.equal(resolveDebateType('derush', 'pshat'), 'strong');
  assert.equal(resolveDebateType('sod', 'remez'), 'strong');
  assert.equal(resolveDebateType('pshat', 'derush'), 'weak');
  assert.equal(resolveDebateType('missing', 'sod'), 'invalid');
  return '4 types, strong/weak/invalid verified';
});

await record('Torah debate handles errors, damage, completion, rewards', () => {
  const player = { xp: 0, items: [], gainXp(n) { this.xp += n; }, inventory: { addItem: (item, quantity) => player.items.push({ item, quantity }) } };
  const debate = new TorahDebateController();
  assert.throws(() => debate.selectPassage('bereishis_1_1'), /No active/);
  assert.throws(() => debate.open('bad_deck'), /Unknown/);
  let state = debate.open('chumash_bereishis_opening', player);
  assert.equal(state.claims.length, 2);
  assert.throws(() => debate.selectPassage('bad_passage'), /Unknown/);
  debate.selectPassage('bereishis_1_1');
  assert.throws(() => debate.playPirush('fake'), /pirush/);
  let safety = 0;
  while (!debate.snapshot().completed && safety < 10) {
    debate.playPirush(safety % 2 ? 'sod' : 'pshat');
    safety += 1;
  }
  state = debate.snapshot();
  assert.equal(state.completed, true);
  assert.equal(player.xp, 180);
  assert.equal(player.items[0].item.id, 'passage_shemos_20_2');
  debate.close();
  assert.equal(debate.snapshot(), null);
  return `completed in ${safety} turns, xp=${player.xp}, items=${player.items.length}`;
});

await record('Chumash reader rejects bad items and exposes every pirush', () => {
  const reader = new ChumashReaderController();
  assert.throws(() => reader.openBook({ id: 'rock' }), /not a readable/);
  const opened = reader.openBook(STARTING_CHUMASH_ITEM);
  assert.equal(opened.passages.length, 2);
  assert.throws(() => reader.openPassage('missing'), /not in this Chumash/);
  const refs = reader.listPassages().map(p => p.ref);
  assert.deepEqual(refs, ['Bereishis 1:1', 'Shemos 20:2']);
  for (const id of STARTING_CHUMASH_ITEM.passageIds) {
    const pirushim = reader.openPassage(id).pirushim;
    assert.deepEqual(Object.keys(pirushim).sort(), ['derush', 'pshat', 'remez', 'sod']);
  }
  reader.close();
  assert.equal(reader.snapshot().book, null);
  return `refs=${refs.join(', ')}`;
});

await record('Responsive dispatcher maps mobile and desktop inputs exactly', () => {
  const d = new ResponsiveActionDispatcher();
  assert.deepEqual(d.dispatch({ device: 'mobile', type: 'tap' }), { action: 'activate', source: 'mobile' });
  assert.deepEqual(d.dispatch({ device: 'mobile', type: 'touchSlot:5' }), { action: 'actionBar', source: 'mobile', slot: 5 });
  assert.deepEqual(d.dispatch({ device: 'desktop', code: 'Digit6' }), { action: 'actionBar', source: 'desktop', slot: 5 });
  assert.deepEqual(d.dispatch({ device: 'desktop', code: 'KeyI' }), { action: 'openInventory', source: 'desktop' });
  assert.deepEqual(d.dispatch({ device: 'mobile', type: 'inventoryButton' }), { action: 'openInventory', source: 'mobile' });
  assert.deepEqual(d.dispatch({ device: 'desktop', code: 'UnknownKey' }), { action: 'unknown', source: 'desktop', code: 'UnknownKey' });
  assert.equal(d.resolveActionSlot('touchSlot:9', 'mobile'), null);
  return 'mobile tap/slot/inventory and desktop key/slot/unknown verified';
});

await record('NPC role postbuild marks only matching NPCs', async () => {
  const yosei = { name: 'npc_reb_yosei', userData: {}, nivraAwtsmoos: { id: 'npc_reb_yosei' } };
  const shlomo = { name: 'npc_reb_shlomo', userData: {}, nivraAwtsmoos: { id: 'npc_reb_shlomo' } };
  const tree = { name: 'tree', userData: {}, nivraAwtsmoos: {} };
  const touched = await ensureNpcRoles({ scene: makeScene([yosei, shlomo, tree]) });
  assert.equal(touched.length, 2);
  assert.equal(yosei.userData.markerGlyph, '!');
  assert.equal(yosei.userData.missionId, 'gather_emerald_wood');
  assert.equal(shlomo.userData.markerGlyph, '📖');
  assert.equal(shlomo.userData.debateDeckId, 'chumash_bereishis_opening');
  assert.equal(tree.userData.markerGlyph, undefined);
  return '2 marked, 1 ignored';
});

await record('Wood collection logic mutates inventory, quest, object, and UI', () => {
  const calls = { items: [], progress: [], ui: [] };
  const actor = {
    inventory: { addItem(item, quantity) { calls.items.push({ item, quantity }); } },
    updateQuestProgress(type, target) { calls.progress.push({ type, target }); }
  };
  const group = { visible: true, userData: {} };
  const olam = { ayshPeula(...args) { calls.ui.push(args); } };
  const result = collectWoodRuntime({ actor, group, amount: 3, collectibleId: 'wood_test', olam });
  assert.deepEqual(result, { collected: true, collectibleId: 'wood_test', amount: 3 });
  assert.equal(calls.items[0].item.className, 'Wood');
  assert.equal(calls.items[0].quantity, 3);
  assert.deepEqual(calls.progress[0], { type: 'collect', target: 'Wood' });
  assert.equal(group.visible, false);
  assert.equal(group.userData.collected, true);
  assert.equal(calls.ui.length, 1);
  return 'inventory + quest + hidden + UI verified';
});

await record('Manifest integrity: decks, passages, wood nodes, files', () => {
  assert.equal(Object.keys(TORAH_DEBATE_DECKS).length, 1);
  assert.equal(Object.keys(CHUMASH_PASSAGES).length, 2);
  assert.equal(EMERALD_WOOD_NODES.length, 6);
  const seen = new Set();
  EMERALD_WOOD_NODES.forEach(node => {
    assert.ok(!seen.has(node.id), `duplicate wood id ${node.id}`);
    seen.add(node.id);
    assert.equal(node.amount, 1);
    assert.equal(node.position.length, 3);
  });
  ['debate/TorahDebateController.js', 'debate/ChumashReaderController.js', 'mobile/ResponsiveActionDispatcher.js', 'postbuild/NpcRolePostBuild.js'].forEach(file => {
    assert.ok(fs.existsSync(path.join(worldRoot, file)), `missing ${file}`);
  });
  return '1 deck, 2 passages, 6 unique wood nodes, 4 runtime files';
});

const failed = results.filter(r => !r.ok);
for (const [index, result] of results.entries()) {
  console.log(`${result.ok ? '✓' : '✗'} [${index + 1}/${results.length}] ${result.name} :: ${result.detail}`);
}

if (failed.length) {
  console.error(`B"H - full stress failed: ${failed.length}/${results.length}`);
  process.exitCode = 1;
} else {
  console.log(`B"H - full stress passed: ${results.length}/${results.length}`);
}
