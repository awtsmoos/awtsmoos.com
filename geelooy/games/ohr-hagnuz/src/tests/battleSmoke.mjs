/** B"H * Battle smoke test */
global.window = { AwtsmoosIntents: { U:0, D:0, L:0, R:0, A:0, B:0 } };

const { State } = await import('../binah/State.js');
const { startDebate, useMove } = await import('../yesod/OhrDebate.js');
const { encounterById } = await import('../data/EncounterIndex.js');

startDebate(encounterById('timekeeper'));
const before = State.Debate.enemyLight;
useMove(0);

console.log(JSON.stringify({
  realm: State.ActiveRealm,
  rank: State.Debate.rank?.label,
  enemy: State.Debate.enemy?.name,
  before,
  after: State.Debate.enemyLight,
  fx: State.BattleFx.length,
  moves: State.Debate.moves.map(m => m.name)
}));
