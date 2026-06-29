// B"H
import { updateCamera } from './camera/rig.js';
import { updateLevelStream, WORLDS, createLevel } from './level.js';
import { saveGame } from './save.js';
import { SEFIROT, addBurst, addText } from './state.js';
import { spiralToward, suctionStep } from './engine/physics.js';
import { clamp, heightAt, len, mix, norm } from './math.js';

/** B"H: Gameplay stays simple; camera now has its own holy work. */
export function step(world, dt) {
  if (world.mode !== 'playing') return updateCamera(world, dt);
  move(world, dt); updateLevelStream(world.level, world.player.x, world.player.y);
  absorb(world, dt); animate(world, dt); upgrades(world); updateCamera(world, dt);
  world.timeLeft -= dt; if (world.score >= world.level.target) win(world); if (world.timeLeft <= 0 && !world.won) lose(world);
}

export function start(world) { world.mode = 'playing'; world.message = 'Streaming chunks awaken around the portal.'; world.events.push(['start']); }
export function restart() { location.reload(); }
export function nextWorld(world) {
  world.save.completed = [...new Set([...world.save.completed, world.level.name])]; saveGame(world.save);
  world.level = createLevel(world.save, world.level.worldIndex + 1);
  Object.assign(world, { mode: 'playing', score: 0, timeLeft: world.level.time, won: false, lost: false, sefirah: 0, absorbers: [], particles: [], floaters: [], message: 'Entered ' + world.level.name + ' via ' + world.level.engine });
}

function move(world, dt) {
  const p = world.player, v = norm(world.input), mag = clamp(len(world.input.x, world.input.y), 0, 1), surge = world.sefirah >= 4 && world.input.pulse > 0 ? 1.45 : 1;
  p.x += v.x * p.speed * mag * surge * dt; p.y += v.y * p.speed * mag * surge * dt;
  p.x = clamp(p.x, -world.level.bounds, world.level.bounds); p.y = clamp(p.y, -world.level.bounds, world.level.bounds); p.z = heightAt(p.x, p.y, world.level.worldIndex);
  world.input.pulse = Math.max(0, world.input.pulse - dt); p.glow = Math.max(0, p.glow - dt * 1.3); p.comboT = Math.max(0, p.comboT - dt); if (!p.comboT) p.combo = mix(p.combo, 1, dt * 2);
}

function absorb(world, dt) { for (const object of world.level.objects) tryAbsorb(world, object, dt); }
function tryAbsorb(world, object, dt) {
  if (object.taken) return; const p = world.player, can = object.r < p.r * (world.sefirah >= 2 ? 1.18 : 0.98);
  if (world.input.pulse > 0 && can) suctionStep(object, p, dt, world.level.worldIndex, world.sefirah >= 1 ? 1.7 : 0.4);
  if (can && Math.hypot(p.x - object.x, p.y - object.y) < p.r * 0.85) reveal(world, object);
}

function reveal(world, object) {
  object.taken = true; world.absorbers.push({ ...object, life: 0.65, ox: object.x, oy: object.y });
  const p = world.player; p.combo = world.sefirah >= 3 ? Math.min(5, p.combo + 0.16) : 1; p.comboT = 3;
  const gain = Math.round(object.sparks * p.combo); world.score += gain; p.r += Math.sqrt(object.sparks) * 0.2; p.h = p.r * 1.42; p.speed = Math.max(145, p.speed - object.sparks * 0.005); p.glow = 1; world.camera.shake = 0.22;
  addText(world, object.x, object.y, object.z + object.h, '+' + gain + ' x' + p.combo.toFixed(1)); world.message = object.hood + ': ' + object.name + ' +' + gain + ' · chunks ' + world.level.streamer.active.length; world.events.push(['reveal', object.sparks]);
}

function animate(world, dt) {
  world.absorbers = world.absorbers.filter(a => { const alive = spiralToward(a, world.player, dt); if (!alive) addBurst(world, a); return alive; });
  world.particles = world.particles.filter(q => { q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt; q.vz -= 260 * dt; q.life -= dt; return q.life > 0 && q.z > 0; });
  world.floaters = world.floaters.filter(f => { f.z += 50 * dt; f.life -= dt; return f.life > 0; });
}

function upgrades(world) { const n = Math.min(SEFIROT.length - 1, Math.floor(world.score / 1000)); if (n > world.sefirah) { world.sefirah = n; world.message = 'Sefirah: ' + SEFIROT[n][0] + ' — ' + SEFIROT[n][1]; world.events.push(['upgrade']); } }
function win(world) { world.won = true; world.mode = 'won'; world.save.best = Math.max(world.save.best, world.score); world.save.completed = [...new Set([...world.save.completed, world.level.name])]; saveGame(world.save); world.message = world.level.name + ' revealed. Next: ' + WORLDS[(world.level.worldIndex + 1) % WORLDS.length][0]; world.events.push(['win']); }
function lose(world) { world.lost = true; world.mode = 'lost'; world.save.best = Math.max(world.save.best, world.score); saveGame(world.save); world.message = 'Concealment returned. Best saved: ' + world.save.best; world.events.push(['lose']); }
