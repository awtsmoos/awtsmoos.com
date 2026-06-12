import { MAPS } from '../js/data/maps.js';
import { createGameState } from '../js/core/state.js';
import { stepState } from '../js/core/loop.js';

/**
 * B"H
 * All-map full simulation smoke.
 *
 * Chapter: every map is renewed by the Awtsmoos. The simulation must remain
 * finite while visual intent, visual style, and bounded cloth are present.
 */
const FRAMES = 900;
const summaries = [];
for (const map of MAPS) summaries.push(runMap(map));
console.log(JSON.stringify({ ok: true, framesPerMap: FRAMES, maps: summaries }, null, 2));

function runMap(map) {
  const state = createGameState(map, 5, {}, {});
  state.phase = 'playing';
  state.fastSim = true;
  const input = neutralInput();
  for (let i = 0; i < FRAMES; i++) stepState(state, input);
  const visible = state.fighters.filter(f => !f.hidden && !f.dead && !f.respawnTimer);
  const bots = state.fighters.filter(f => !f.human);
  assert(state.frame === FRAMES, map.id + ': frame mismatch');
  assert(bots.every(bot => bot.input), map.id + ': bot missing input');
  assert(bots.every(bot => bot.ai?.mode || bot.aiMind?.debug), map.id + ': bot missing AI runtime state');
  assert(state.fighters.every(finiteFighter), map.id + ': non-finite fighter or bone');
  assert(visible.every(f => f.poseIntent), map.id + ': visible fighter missing poseIntent');
  assert(visible.every(f => f.visualStyle?.body && f.visualStyle?.style && f.visualStyle?.clothing), map.id + ': visible fighter missing visualStyle');
  assert(visible.every(finiteCloth), map.id + ': non-finite or runaway cloth');
  assert((state.events?.length || 0) === 0, map.id + ': fastSim events not cleared');
  assert((state.particles?.length || 0) < 900, map.id + ': particle count too high');
  return { id: map.id, fighters: state.fighters.length, alive: visible.length, particles: state.particles?.length || 0, maxAbsX: Math.round(Math.max(...state.fighters.map(f => Math.abs(f.x || 0)))), minY: Math.round(Math.min(...state.fighters.map(f => f.y || 0))), botModes: bots.map(bot => bot.ai?.mode || null), poseMoods: bots.map(bot => bot.poseIntent?.mood || null), clothKinds: visible.slice(0, 3).map(f => f.visualStyle?.clothing?.kind || null) };
}
function neutralInput() { return { x: 0, y: 0, aimX: 1, aimY: 0, down: false, jump: false, punch: false, kick: false, grab: false, shield: false, special: false }; }
function finiteFighter(f) { if (!Number.isFinite(f.x) || !Number.isFinite(f.y) || !Number.isFinite(f.vx || 0) || !Number.isFinite(f.vy || 0)) return false; if (f.hidden || f.dead || f.respawnTimer) return true; return Object.values(f.bones || {}).every(bone => !bone.root || !bone.tip || (Number.isFinite(bone.root.x) && Number.isFinite(bone.root.y) && Number.isFinite(bone.tip.x) && Number.isFinite(bone.tip.y))); }
function finiteCloth(f) { for (const chain of Object.values(f.clothState || {})) { if (!Array.isArray(chain)) continue; if (chain.length > 8) return false; if (!chain.every(p => Number.isFinite(p.x) && Number.isFinite(p.y))) return false; } return true; }
function assert(condition, message) { if (!condition) throw new Error(message); }
