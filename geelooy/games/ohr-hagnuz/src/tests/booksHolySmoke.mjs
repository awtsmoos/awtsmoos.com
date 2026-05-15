/** B"H * Books / holy places smoke test. */
global.window = { AwtsmoosIntents: { U:0, D:0, L:0, R:0, A:0, B:0 } };

const { State } = await import('../binah/State.js');
const { learnBook, torahPower } = await import('../yesod/books/TorahBooks.js');
const { healAtSynagogue, doMitzvah } = await import('../yesod/holy/HolyPlaces.js');
const { resolveStats } = await import('../yesod/equipment/StatResolver.js');

State.Stats.light = 12;
learnBook('mishnahSeeds');
learnBook('TanyaFlame');
healAtSynagogue('Small Synagogue');
doMitzvah('Mitzvah Station');

console.log(JSON.stringify({
  light: State.Stats.light,
  sparks: State.Stats.sparks,
  books: State.Inventory.books.length,
  torahPower: torahPower(),
  stats: resolveStats(),
  counters: State.Quests.counters
}));
