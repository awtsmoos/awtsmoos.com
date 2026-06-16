import { stepSpectacleFromEvents } from '../js/spectacle/spectacleEvents.js';
import { stepSpectacleState } from '../js/spectacle/spectacleState.js';

/**
 * B"H
 * Spectacle probe with player-only screen flash law.
 * AI-on-AI hits may make local rings. The white screen and camera quake awaken
 * only when the human fighter is the one being hit.
 */
const aiHit = makeState(false);
stepSpectacleFromEvents(aiHit);
assert((aiHit.spectacle.flash || 0) === 0, 'AI-on-AI hit must not flash the whole screen');
assert((aiHit.spectacle.shake || 0) === 0, 'AI-on-AI hit must not camera shake');
assert(aiHit.spectacle.rings.length === 1, 'AI-on-AI hit should keep local shock ring');
assert(aiHit.spectacle.afterimages.length === 2, 'AI-on-AI hit should keep body afterimages');

const playerHit = makeState(true);
stepSpectacleFromEvents(playerHit);
assert(playerHit.spectacle.flash > 0.3, 'player-target mythic hit should create flash');
assert(playerHit.spectacle.shake > 8, 'player-target mythic hit should create camera shake');
assert(playerHit.spectacle.rings.length === 1, 'player-target hit should create shock ring');
assert(playerHit.spectacle.streaks.length === 1, 'player-target hit should create launch streak');
const flash = playerHit.spectacle.flash;
stepSpectacleState(playerHit);
assert(playerHit.spectacle.flash < flash, 'spectacle pressure should decay');
console.log(JSON.stringify({ ok: true, aiHit: aiHit.spectacle, playerHit: playerHit.spectacle }, null, 2));
function makeState(playerTarget) { return { frame: 1, fighters: [{ id: 'attacker', x: 100, y: 200, dna: { hue: 24 } }, { id: 'target', human: playerTarget, x: 190, y: 210, dna: { hue: 205 } }], events: [{ type: 'hit', attackerId: 'attacker', targetId: 'target', x: 170, y: 150, force: 62, damage: 24, koDanger: true, color: '#fff1a6', side: 1, vector: { x: 1, y: -0.45 } }] }; }
function assert(condition, message) { if (!condition) throw new Error(message); }
