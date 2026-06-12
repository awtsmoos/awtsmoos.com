import { MAPS } from '../js/data/maps.js';
import { createGameState } from '../js/core/state.js';
import { stepState } from '../js/core/loop.js';

const input = { x: 0, y: 0, aimX: 1, aimY: 0, down: false, jump: false, punch: false, kick: false, grab: false, shield: false, special: false };
const map = MAPS.find(m => m.id === 'beit-midrash-bouncer') || MAPS[0];
const state = createGameState(map, 2, {}, {});
state.phase = 'playing';
const target = state.fighters[1];
state.hazards.push({ id: 'forcedBomb', kind: 'fallingBomb', name: 'Forced Bomb', color: '#ff7b55', x: target.x, y: target.y - 80, timer: 1, active: false, radius: 180, damage: 11, knock: 24, hitIds: new Set(), born: 0 });
const before = target.damage;
for (let i = 0; i < 5; i++) stepState(state, input);
console.log(JSON.stringify({ before, after: target.damage, hazardHits: state.stageDirector.hazardHits || 0, hazardsRemaining: state.hazards.length, events: state.events.length, particles: state.particles.length }, null, 2));
