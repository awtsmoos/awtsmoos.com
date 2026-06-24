/** B"H - Save runtime persistence, migration, export/import, and corruption recovery. */
import assert from 'node:assert/strict';
import { State } from '../../src/binah/State.js';
import { createMemoryStorage } from '../../src/yesod/save/SaveStorage.js';
import { clearSave, exportSave, importSave, loadGame, loadSaveEnvelope, saveGame } from '../../src/yesod/save/SaveRuntime.js';
import { SAVE_KEY } from '../../src/yesod/save/SaveSchema.js';

const storage = createMemoryStorage();
clearSave(storage);
State.MapId = 'Overworld_Main';
State.resetHero(4, 5, 'r');
State.Stats.level = 7;
State.Inventory.money = 123;
State.Quests.completed.first_light = true;

const saved = saveGame(storage);
assert.equal(saved.ok, true, 'save writes to storage');
assert.ok(storage.getItem(SAVE_KEY).includes('schemaVersion'), 'save envelope has schema');

State.MapId = 'Broken_Test_Map';
State.resetHero(1, 1, 'd');
State.Stats.level = 1;
State.Inventory.money = 0;
const loaded = loadGame(storage);
assert.equal(loaded.ok, true, 'load restores data');
assert.equal(State.MapId, 'Overworld_Main');
assert.equal(State.Hero.cx, 4);
assert.equal(State.Hero.cy, 5);
assert.equal(State.Stats.level, 7);
assert.equal(State.Inventory.money, 123);
assert.equal(State.Quests.completed.first_light, true);
assert.equal(State.HeroPath.length, 0, 'transient path cleared');

const exported = exportSave();
State.Inventory.money = 1;
const imported = importSave(exported, storage);
assert.equal(imported.ok, true, 'import accepts exported save');
assert.equal(State.Inventory.money, 123);

storage.setItem(SAVE_KEY, '{not-json');
const corrupt = loadSaveEnvelope(storage);
assert.equal(corrupt.ok, false);
assert.equal(corrupt.reason, 'corrupt-json');
console.log('BH_SAVE_RUNTIME_TEST_PASS');
