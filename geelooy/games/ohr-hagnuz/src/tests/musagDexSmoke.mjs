/** B"H @file musagDexSmoke.mjs */
const assert = (condition, message) => { if (!condition) throw new Error(message); };
globalThis.window = { AwtsmoosIntents: { U: 0, D: 0, L: 0, R: 0, A: 0, B: 0 } };
const { State } = await import('../binah/State.js');
const { EncounterIndex } = await import('../data/EncounterIndex.js');
const { discoverMusag, recordMusag, dexSummary, dexLine, dexRows, musagStatBonus } = await import('../yesod/musag/MusagDex.js');

State.MapId = 'Rambam_Garden';
State.MusagDex = { found: {}, mastery: {}, species: {}, evolutions: {} };

const encounter = EncounterIndex.wildBikkurim;
assert(discoverMusag(encounter).seen === 1, 'discovery did not increment seen');
recordMusag(encounter, true);
recordMusag(encounter, true);
const third = recordMusag(encounter, true);
assert(third.sweetened === 3, 'victory count wrong');

const summary = dexSummary();
assert(summary.length === 1, 'summary missing entry');
assert(summary[0].mastery === 'bronze', 'mastery tier should be bronze');
assert(summary[0].evolution === 'Flavor', 'evolution not unlocked');
assert(dexLine().includes('1 evolved'), 'dex line missing evolution count');
assert(dexRows()[0][1].includes('Flavor'), 'dex rows missing evolution');
assert((musagStatBonus().chochmah || 0) >= 1, 'stat bonus not derived');

console.log(JSON.stringify({ ok: true, line: dexLine(), summary, rows: dexRows(), bonus: musagStatBonus() }, null, 2));
