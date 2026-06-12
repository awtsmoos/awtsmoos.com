import { MAPS } from '../js/data/maps.js';
import { createGameState } from '../js/core/state.js';
import { stepState } from '../js/core/loop.js';

const map = MAPS.find(m => m.id === 'merkava-pinball-court') || MAPS[0];
const state = createGameState(map, 1, {}, {});
state.phase = 'playing';
state.fastSim = true;
const hero = state.fighters.find(f => f.human);
const bot = state.fighters.find(f => !f.human);
hero.x = 0;
hero.y = 0;
hero.damage = 110;
hero.grounded = true;
bot.x = 72;
bot.y = 0;
bot.face = -1;
bot.grounded = true;
bot.aiMind ||= {};
const humanInput = { x: -1, y: 0, aimX: -1, aimY: 0, down: false, jump: false, punch: false, kick: false, grab: false, shield: false, special: false };
for (let i = 0; i < 180; i++) {
  bot.input = { x: -1, y: 0, aimX: -1, aimY: 0, down: false, jump: false, punch: i % 4 === 0, kick: false, grab: false, shield: false, special: false, rapidPunch: true };
  stepState(state, humanInput);
}
console.log(JSON.stringify({
  heroDamage: Math.round(hero.damage),
  heroX: Math.round(hero.x),
  heroY: Math.round(hero.y),
  heroVx: Math.round(hero.vx * 100) / 100,
  heroVy: Math.round(hero.vy * 100) / 100,
  rapidMobilityFrames: hero.rapidMobilityFrames || 0,
  rapidJailActive: !!hero.rapidJail?.active,
  stun: Math.round(hero.stun || 0),
  stocks: hero.stocks,
  particles: state.particles.length,
  hitstop: state.hitstop || 0
}, null, 2));
