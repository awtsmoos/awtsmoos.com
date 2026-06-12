import { MAPS } from '../js/data/maps.js';
import { createGameState } from '../js/core/state.js';
import { stepState } from '../js/core/loop.js';

const input = { x: 0, y: 0, aimX: 1, aimY: 0, down: false, jump: false, punch: false, kick: false, grab: false, shield: false, special: false };
const map = MAPS.find(m => m.id === 'merkava-pinball-court') || MAPS[0];
const state = createGameState(map, 5, {}, {});
state.phase = 'playing';
for (let i = 0; i < 4200; i++) stepState(state, input);
console.log(JSON.stringify({
  map: map.id,
  frame: state.frame,
  itemsSpawned: state.stageDirector.itemsSpawned || 0,
  itemsPickedUp: state.stageDirector.itemsPickedUp || 0,
  hazardsSpawned: state.stageDirector.hazardsSpawned || 0,
  hazardHits: state.stageDirector.hazardHits || 0,
  objectiveSpawns: state.stageDirector.objectiveSpawns || 0,
  objectiveClaims: state.stageDirector.objectiveClaims || 0,
  activePowerups: state.powerups.filter(p => p.active).length,
  stageBornPowerups: state.powerups.filter(p => p.stageBorn).length,
  hazardsRemaining: state.hazards.length,
  objectiveActive: !!state.objective,
  objectiveHold: state.objective?.hold || 0,
  scars: state.scars.length,
  particles: state.particles.length,
  mood: state.stageMood,
  winner: state.winner || null,
  maxDamage: Math.max(...state.fighters.map(f => f.damage || 0))
}, null, 2));
