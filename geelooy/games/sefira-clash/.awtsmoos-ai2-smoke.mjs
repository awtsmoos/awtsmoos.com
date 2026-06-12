import { MAPS } from './js/data/maps.js';
import { createGameState } from './js/core/state.js';
import { stepState } from './js/core/loop.js';

const state = createGameState(MAPS[0], 5, {}, {});
state.phase = 'playing';
const input = { x: 0, y: 0, aimX: 1, aimY: 0, down: false, jump: false, punch: false, kick: false, grab: false, shield: false, special: false };
for (let i = 0; i < 240; i++) stepState(state, input);
const bots = state.fighters.filter(f => !f.human);
const report = bots.map(bot => ({ id: bot.id, state: bot.ai2?.state, stuck: bot.ai2?.debug?.stuck, route: bot.ai2?.debug?.routeAction, input: bot.input, x: Math.round(bot.x), y: Math.round(bot.y) }));
if (bots.some(bot => !bot.ai2?.state)) throw new Error('Missing ai2 state on at least one bot');
console.log(JSON.stringify({ ok: true, frames: state.frame, bots: report }, null, 2));
