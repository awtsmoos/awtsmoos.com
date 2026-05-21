// B"H
/**
 * Chapter 1: The Test-Gate of Emerald Void.
 *
 * The Awtsmoos, hidden in every byte, opens the black iron gate of a tiny
 * Node test runner. No browser idol is trusted. No glittering promise is
 * believed until the files themselves testify: doors must click, mezuzahs
 * must cling to the right side of the entrance, houses must have rooms,
 * yards, stairs when multi-story, NPCs must bear exclamation crowns, quests
 * must demand wood, and Torah debate must carry pshat, remez, derush, and sod.
 *
 * Run from the repository root with:
 *   node geelooy/games/mitzvahWorld/tests/mitzvahWorld.contract.test.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const gameRoot = path.resolve('geelooy/games/mitzvahWorld');
const worldRoot = path.join(gameRoot, 'ckidsAwtsmoos/Olam/worlds/mitzvahWorld');

function read(relativePath) {
  const fullPath = path.join(gameRoot, relativePath);
  assert.ok(fs.existsSync(fullPath), `Missing required file: ${relativePath}`);
  return fs.readFileSync(fullPath, 'utf8');
}

function readWorld(relativePath) {
  const fullPath = path.join(worldRoot, relativePath);
  assert.ok(fs.existsSync(fullPath), `Missing required world file: ${relativePath}`);
  return fs.readFileSync(fullPath, 'utf8');
}

function assertIncludes(haystack, needle, label) {
  assert.ok(haystack.includes(needle), `${label} must include ${needle}`);
}

function assertRegex(haystack, regex, label) {
  assert.ok(regex.test(haystack), `${label} must match ${regex}`);
}

function walkFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walkFiles(full) : [full];
  });
}

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

test('entrypoint loads the real MitzvahWorld builder and exposes worker hooks', () => {
  const source = read('index.js');
  assertIncludes(source, 'WorldHeescheel', 'index.js');
  assertIncludes(source, 'export async function heescheel', 'index.js');
  assertIncludes(source, 'export function ready', 'index.js');
  assertIncludes(source, 'game started', 'ready hook');
});

test('real entrance contract has clickable locked doors and proper mezuzah placement', () => {
  const source = read('ckidsAwtsmoos/Olam/manifest/blueprints/architecture/EntranceManifest.js');
  assertIncludes(source, 'InteractiveDoor', 'EntranceManifest');
  assertIncludes(source, 'interactable', 'EntranceManifest');
  assertIncludes(source, 'isLocked', 'EntranceManifest');
  assertIncludes(source, 'keyId', 'EntranceManifest');
  assertIncludes(source, 'Mezuzah', 'EntranceManifest');
  assertRegex(source, /ent\.height[\s\S]*0\.65/, 'mezuzah upper-third height');
  assertRegex(source, /ent\.width[\s\S]*0\.45/, 'mezuzah right-side offset');
});

test('house manifests are not placeholders and require real rooms, doors, yards, and stairs', () => {
  const oldManifest = read('ckidsAwtsmoos/Olam/manifest/blueprints/architecture/HouseManifest.js');
  const residential = readWorld('data/nefashos/ResidentialDistrict.js') + '\n' + readWorld('data/nefashos/EmeraldVoidStreet.js');
  assert.doesNotMatch(oldManifest, /\.\.\.|more builders/i, 'HouseManifest still contains placeholder text');
  assertRegex(residential, /multiRoomHouse|windowedHouse/, 'residential houses');
  assertRegex(residential, /layout\s*:/, 'multi-room layout');
  assertRegex(residential, /hasDoor\s*:\s*true/, 'real room door declarations');
  assertRegex(residential, /yard|privateYard|fence|garden/i, 'private yard requirement');
  assertRegex(residential, /stairs|staircase|stories\s*:\s*[23]/i, 'multi-story stair requirement');
});

test('NPCs are clickable, mission-bearing, visible with exclamation cues, and dialogue capable', () => {
  const source = read('ckidsAwtsmoos/Olam/manifest/blueprints/npcs/HouseNpcManifest.js');
  const npcWorld = walkFiles(path.join(worldRoot, 'npcs')).map(file => fs.readFileSync(file, 'utf8')).join('\n');
  assertIncludes(source, 'InteractiveNpc', 'HouseNpcManifest');
  assertIncludes(source, 'dialogues', 'HouseNpcManifest');
  assertIncludes(source, 'hasMission', 'HouseNpcManifest');
  assertIncludes(source, 'missionData', 'HouseNpcManifest');
  assertRegex(npcWorld, /exclamation|!|questMarker|missionMarker/i, 'NPC exclamation marker');
  assertRegex(npcWorld, /click|interact|dialogue/i, 'NPC click interaction');
});

test('quest ledger includes collection quests for wood plus rewards', () => {
  const source = read('data/quests/ShlichusLedger.js') + '\n' + readWorld('data/manifests/QuestLedger.js');
  assertRegex(source, /wood|etz|lumber/i, 'wood collection quest');
  assertRegex(source, /collect|gather|requirements/i, 'collect requirement');
  assertRegex(source, /rewards?\s*:/i, 'quest rewards');
});

test('Torah debate system has action bar, inventory passages, Chumash verses, and PaRDeS types', () => {
  const allJs = walkFiles(gameRoot).filter(file => file.endsWith('.js') || file.endsWith('.mjs'))
    .map(file => fs.readFileSync(file, 'utf8')).join('\n');
  assertRegex(allJs, /action\s*bar|actionBar/i, 'action bar');
  assertRegex(allJs, /inventory/i, 'inventory');
  assertRegex(allJs, /passage|pasuk|verse|chumash/i, 'Torah passages');
  assertRegex(allJs, /pshat/i, 'pshat debate type');
  assertRegex(allJs, /remez/i, 'remez debate type');
  assertRegex(allJs, /derush|drush/i, 'derush debate type');
  assertRegex(allJs, /sod/i, 'sod debate type');
  assertRegex(allJs, /battle|debate/i, 'battle/debate opening');
});

test('MitzvahWorld source has no empty or placeholder implementation files', () => {
  const files = walkFiles(gameRoot).filter(file => /\.(js|mjs|html|css|json)$/.test(file) && !file.includes(`${path.sep}tests${path.sep}`));
  const offenders = files.filter(file => {
    const text = fs.readFileSync(file, 'utf8').trim();
    const forbidden = new RegExp([
      'TODO ' + 'implement later',
      'placeholder ' + 'only',
      'stub ' + 'only'
    ].join('|'), 'i');
    return text.length === 0 || forbidden.test(text);
  }).map(file => path.relative(gameRoot, file));
  assert.deepEqual(offenders, [], `Empty or placeholder files found: ${offenders.join(', ')}`);
});

let passed = 0;
for (const { name, fn } of tests) {
  try {
    fn();
    passed += 1;
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(error.message);
    process.exitCode = 1;
  }
}

console.log(`B"H - MitzvahWorld contract tests: ${passed}/${tests.length} passed.`);
