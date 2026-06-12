import { stepSpectacleFromEvents } from '../js/spectacle/spectacleEvents.js';
import { stepSpectacleState } from '../js/spectacle/spectacleState.js';

/**
 * B"H
 * Spectacle probe.
 *
 * Chapter 13: in the silent headless chamber, no canvas flashes and no player
 * gasps, but the Awtsmoos renews even numbers from nothing. This probe asks the
 * brawl one question: when a mythic hit occurs, does visible pressure awaken?
 */
const state = {
  frame: 1,
  fighters: [
    { id: 'attacker', x: 100, y: 200, dna: { hue: 24 } },
    { id: 'target', x: 190, y: 210, dna: { hue: 205 } }
  ],
  events: [{
    type: 'hit', attackerId: 'attacker', targetId: 'target',
    x: 170, y: 150, force: 62, damage: 24, koDanger: true,
    color: '#fff1a6', side: 1, vector: { x: 1, y: -0.45 }
  }]
};

stepSpectacleFromEvents(state);
assert(state.spectacle.flash > 0.3, 'mythic hit should create flash');
assert(state.spectacle.shake > 8, 'mythic hit should create camera shake');
assert(state.spectacle.rings.length === 1, 'mythic hit should create shock ring');
assert(state.spectacle.streaks.length === 1, 'mythic hit should create launch streak');
assert(state.spectacle.afterimages.length === 2, 'mythic hit should remember both bodies');
const flash = state.spectacle.flash;
stepSpectacleState(state);
assert(state.spectacle.flash < flash, 'spectacle pressure should decay');
console.log(JSON.stringify({ ok: true, spectacle: state.spectacle }, null, 2));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
