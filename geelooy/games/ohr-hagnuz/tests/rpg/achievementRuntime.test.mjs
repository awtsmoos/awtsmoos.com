/** B"H - Achievement runtime unlock and persistence test. */
import assert from 'node:assert/strict';
import { State } from '../../src/binah/State.js';
import { achievementSummary, ensureAchievements, evaluateAchievements, unlockAchievement } from '../../src/yesod/achievements/AchievementRuntime.js';
import { createMemoryStorage } from '../../src/yesod/save/SaveStorage.js';
import { loadGame, saveGame } from '../../src/yesod/save/SaveRuntime.js';

State.Achievements = null;
State.Storage = { money: 3, items: {}, garments: [], history: [] };
State.ItemInstances = { seq: 1, items: { itm_1: { id: 'itm_1' } }, containers: { bag: ['itm_1'] } };
State.Quests.completed = { first_light: true };
State.MusagDex.seenCount = 1;
State.Stats.debatesWon = 10;
State.Story.active = 'Ohr HaGnuz Revealed';

assert.equal(ensureAchievements().points, 0);
const unlocked = evaluateAchievements();
assert.ok(unlocked.includes('first_storage'));
assert.ok(unlocked.includes('declaration'));
assert.equal(unlockAchievement('declaration').duplicate, true);
assert.equal(achievementSummary().done >= 6, true);

const storage = createMemoryStorage();
saveGame(storage);
State.Achievements = null;
assert.equal(loadGame(storage).ok, true);
assert.equal(State.Achievements.unlocked.declaration.title, 'Final Declaration');
console.log('BH_ACHIEVEMENT_RUNTIME_TEST_PASS');
