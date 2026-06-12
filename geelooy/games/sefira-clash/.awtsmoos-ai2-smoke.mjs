import { MAPS } from './js/data/maps.js';
import { createGameState } from './js/core/state.js';
import { stepState } from './js/core/loop.js';

/**
 * B"H
 * Full simulation smoke for the unified advanced AI and body-language renderer.
 *
 * Chapter 33: the old test searched for `ai2`, a vessel that has already been
 * folded into the larger river of `aiMind`. The Awtsmoos renews the match now,
 * so the test asks the living questions: do bots think, move, pose, and remain
 * finite for a real burst of combat?
 */
const state = createGameState(MAPS[0], 5, {}, {});
state.phase = 'playing';
state.fastSim = true;
const input = neutralInput();
for (let i = 0; i < 720; i++) stepState(state, input);

const bots = state.fighters.filter(f => !f.human);
const report = bots.map(botReport);
assert(state.frame === 720, `expected 720 frames, got ${state.frame}`);
assert(bots.length === 5, `expected 5 bots, got ${bots.length}`);
assert(bots.every(bot => bot.input), 'every bot should have an input object');
assert(bots.every(bot => bot.ai?.mode || bot.aiMind?.debug), 'every bot should expose current advanced AI state');
assert(state.fighters.every(finiteFighter), 'all fighters should have finite coordinates and skeletons');
assert((state.particles?.length || 0) < 900, 'particle pool should stay bounded');
assert((state.events?.length || 0) === 0, 'fast sim should clear invisible events');

console.log(JSON.stringify({
  ok: true,
  frames: state.frame,
  map: state.map.id,
  fighters: state.fighters.length,
  particles: state.particles?.length || 0,
  spectacle: summarizeSpectacle(state.spectacle),
  bots: report
}, null, 2));

function neutralInput() {
  return { x: 0, y: 0, aimX: 1, aimY: 0, down: false, jump: false, punch: false, kick: false, grab: false, shield: false, special: false };
}

function botReport(bot) {
  return {
    id: bot.id,
    mode: bot.ai?.mode || null,
    role: bot.aiMind?.role?.name || bot.aiMind?.role || null,
    tactic: bot.aiMind?.combatTactic?.kind || null,
    debugMode: bot.aiMind?.debug?.mode || null,
    input: bot.input,
    x: Math.round(bot.x),
    y: Math.round(bot.y),
    poseMood: bot.poseIntent?.mood || null,
    damageBand: bot.anim?.damageBand || null
  };
}

function finiteFighter(f) {
  if (!Number.isFinite(f.x) || !Number.isFinite(f.y)) return false;
  if (f.hidden || f.dead || f.respawnTimer) return true;
  return Object.values(f.bones || {}).every(bone => !bone.root || !bone.tip || (
    Number.isFinite(bone.root.x) && Number.isFinite(bone.root.y) && Number.isFinite(bone.tip.x) && Number.isFinite(bone.tip.y)
  ));
}

function summarizeSpectacle(s) {
  if (!s) return null;
  return { flash: round(s.flash), shake: round(s.shake), rings: s.rings?.length || 0, streaks: s.streaks?.length || 0, afterimages: s.afterimages?.length || 0 };
}

function round(value) {
  return Math.round((value || 0) * 1000) / 1000;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
