import { impactTier } from './impactTiers.js';
import { addSpectacleImpulse, ensureSpectacle } from './spectacleState.js';

/**
 * B"H
 * Event-to-spectacle interpreter.
 *
 * Chapter 7 revised: AI-on-AI violence may throw local rings and afterimages,
 * but the white sky-flash and camera punch belong only to the human being hit.
 */
export function stepSpectacleFromEvents(state) {
  const s = ensureSpectacle(state);
  for (const event of state.events || []) routeSpectacleEvent(state, s, event);
  trimSpectacle(s);
}
function routeSpectacleEvent(state, s, event) {
  if (event.type === 'hit') return addHitSpectacle(state, s, event);
  if (event.type === 'wall') return addWallSpectacle(state, s, event);
  if (event.type === 'fall') return addFallSpectacle(state, s, event);
  if (event.type === 'pickup') return addPickupSpectacle(s, event);
}
function addHitSpectacle(state, s, event) {
  const tier = impactTier(event), humanTarget = isHumanTarget(state, event);
  if (humanTarget) addSpectacleImpulse(state, tier);
  if (tier.ring) s.rings.push(ringFrom(event, tier, humanTarget));
  if (tier.streak) s.streaks.push(streakFrom(event, tier));
  if (event.attackerId) rememberAfterimage(state, s, event.attackerId, tier);
  if (event.targetId) rememberAfterimage(state, s, event.targetId, tier, true);
  event.spectacleTier = tier.name;
  event.shockwave = event.shockwave || tier.ring > 90;
}
function addWallSpectacle(state, s, event) {
  if (isHumanEvent(state, event)) addSpectacleImpulse(state, { flash: 0.04, tint: 0.02, shake: Math.min(3, (event.force || 16) / 10), zoomKick: 0 });
  const force = event.force || 16;
  s.rings.push({ x: event.x, y: event.y, radius: 34 + force * 1.5, life: 18, maxLife: 18, color: '#ffcf8a', line: 5 });
}
function addFallSpectacle(state, s, event) {
  if (isHumanEvent(state, event)) addSpectacleImpulse(state, { flash: 0.34, tint: 0.18, shake: 9, zoomKick: 0.04 });
  s.rings.push({ x: event.x, y: event.y, radius: 190, life: 32, maxLife: 32, color: event.color || '#ff8a6b', line: 9 });
  s.streaks.push({ x: event.x, y: event.y, vx: (event.dirX || 0) * -120, vy: (event.dirY || -1) * -120, life: 26, maxLife: 26, color: event.color || '#ff8a6b', width: 14 });
}
function addPickupSpectacle(s, event) { s.rings.push({ x: event.x, y: event.y, radius: 52, life: 22, maxLife: 22, color: event.color || '#c8fff1', line: 4 }); }
function ringFrom(event, tier, humanTarget) { return { x: event.x, y: event.y, radius: humanTarget ? tier.ring : Math.max(36, tier.ring * 0.55), life: 18 + tier.shake * 2, maxLife: 18 + tier.shake * 2, color: event.color || '#fff1a6', line: 3 + tier.shake * 0.8 }; }
function streakFrom(event, tier) { const side = event.side || 1, vector = event.vector || { x: side, y: -0.35 }; return { x: event.x, y: event.y, vx: vector.x * 120 * tier.streak, vy: vector.y * 120 * tier.streak, life: 14 + tier.shake * 1.7, maxLife: 14 + tier.shake * 1.7, color: event.color || '#fff1a6', width: 4 + tier.shake }; }
function rememberAfterimage(state, s, fighterId, tier, target = false) { if (tier.name === 'tiny') return; const f = state.fighters?.find(item => item.id === fighterId); if (!f) return; s.afterimages.push({ x: f.x, y: f.y, hue: f.dna?.hue || 180, life: target ? 12 : 16, maxLife: target ? 12 : 16, radius: target ? 42 : 34 }); }
function isHumanTarget(state, event) { return !!state.fighters?.find(f => f.id === event.targetId && f.human); }
function isHumanEvent(state, event) { return !!state.fighters?.find(f => (f.id === event.targetId || f.id === event.fighterId || f.id === event.id) && f.human); }
function trimSpectacle(s) { if (s.rings.length > 24) s.rings.splice(0, s.rings.length - 24); if (s.streaks.length > 18) s.streaks.splice(0, s.streaks.length - 18); if (s.afterimages.length > 24) s.afterimages.splice(0, s.afterimages.length - 24); }
