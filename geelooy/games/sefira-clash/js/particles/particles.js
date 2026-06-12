import { PARTICLE_BUDGET, isCalloutParticle, isLetterParticle } from './particleBudget.js';

/**
 * B"H
 * Hard-capped pooled impact-particle simulation.
 *
 * Chapter 110: the hit point still opens a gate of Hebrew fire, but the gate is
 * guarded. Rapid punching may create infinite desire, never infinite particles.
 * Letters are capped, old glyphs are recycled, hit visuals are budgeted per
 * frame, and trimming uses swap-release instead of slow array shifting.
 */
const TWO_PI = Math.PI * 2;
const IMPACT_LETTERS = ['א', 'ש', 'כ', 'ד', 'מ', 'נ', 'צ', 'ר', 'ל'];
const FALL_LETTERS = ['נ', 'פ', 'ל', 'ה', 'א', 'ש'];

export function addEventParticles(state) {
  initPool(state);
  const events = state.events;
  const frame = freshFrameBudget();
  for (let i = 0; i < events.length && frame.events < PARTICLE_BUDGET.maxEventsPerFrame; i++) {
    routeEvent(state, events[i], frame);
    frame.events++;
  }
  events.length = 0;
  trimParticles(state);
}

export function stepParticles(state) {
  initPool(state);
  const particles = state.particles;
  let write = 0;
  for (let read = 0; read < particles.length; read++) {
    const p = particles[read];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= p.drag || 0.97;
    p.vy = p.vy * (p.drag || 0.97) + (p.gravity || 0.04);
    p.spin += p.spinVel || 0;
    p.life--;
    if (p.life > 0) particles[write++] = p;
    else releaseParticle(state, p);
  }
  particles.length = write;
}

function routeEvent(state, e, frame) {
  if (e.type === 'hit') addHitBurst(state, e, frame);
  else if (e.type === 'wall') addWallBurst(state, e, frame);
  else if (e.type === 'fall') addFallBurst(state, e, frame);
  else if (e.type === 'pickup') addPickupBurst(state, e, frame);
  else if (e.type === 'narrative') addCallout(state, e, frame);
}

function addHitBurst(state, e, frame) {
  if (frame.hitVisuals >= PARTICLE_BUDGET.maxHitVisualsPerFrame && e.rapid) return;
  frame.hitVisuals++;
  const damage = e.damage || 1;
  const force = e.force || damage;
  const big = e.fullCharge || e.shockwave || force > 34 || damage > 20;
  const side = e.side || Math.sign(e.dirX || 1) || 1;
  addImpactCore(state, e, sparkCount(e, big), force, side);
  addHebrewSpray(state, e, glyphCount(e, big), IMPACT_LETTERS, force, side);
  if (!e.rapid) addSlashFan(state, e, big ? 4 : 2, side);
  if (!e.rapid || damage >= 6) addNumber(state, e, damage);
  if (big && !e.rapid) addShockRing(state, e, 54);
  if ((damage >= 24 || big) && !e.rapid) addCallout(state, { ...e, text: big ? 'מכה!' : 'HIT' }, frame);
}

function sparkCount(e, big) {
  if (e.rapid) return PARTICLE_BUDGET.rapidSparks;
  return big ? PARTICLE_BUDGET.hugeSparks : PARTICLE_BUDGET.normalSparks;
}

function glyphCount(e, big) {
  if (e.rapid) return PARTICLE_BUDGET.rapidGlyphs;
  return big ? PARTICLE_BUDGET.hugeGlyphs : PARTICLE_BUDGET.normalGlyphs;
}

function addImpactCore(state, e, count, force, side) {
  for (let i = 0; i < count; i++) {
    const a = -0.25 * side + (Math.random() - 0.5) * 2.7;
    const speed = 2.6 + Math.random() * 5.2 + force * 0.04;
    spawn(state, 'spark', e.x, e.y, Math.cos(a) * speed * side, Math.sin(a) * speed, 10 + Math.random() * 10, e.color || '#f8d66a', 0, '', 0.91, 0.035, Math.random() * 0.4);
  }
}

function addFallBurst(state, e, frame) {
  const dx = -(e.dirX || 0);
  const dy = -(e.dirY || 0);
  const base = Math.atan2(dy, dx);
  for (let i = 0; i < 28; i++) {
    const a = base + (Math.random() - 0.5) * 1.35;
    const speed = 4.5 + Math.random() * 9;
    spawn(state, 'spark', e.x, e.y, Math.cos(a) * speed, Math.sin(a) * speed, 24 + Math.random() * 20, e.color || '#ff8a6b', 0, '', 0.925, 0.015, Math.random() * 0.4);
  }
  addHebrewSpray(state, e, 8, FALL_LETTERS, 70, Math.sign(dx || 1));
  addShockRing(state, e, 88);
  addCallout(state, { ...e, text: e.text || 'OUT' }, frame);
}

function addHebrewSpray(state, e, count, letters, force, side) {
  for (let i = 0; i < count; i++) {
    const letter = e.letter && i === 0 ? e.letter : letters[(i + Math.floor(Math.random() * letters.length)) % letters.length];
    const a = Math.random() * TWO_PI;
    const speed = 1.5 + Math.random() * 3.8 + force * 0.018;
    spawnLetter(state, e.x + rand(13), e.y + rand(10), Math.cos(a) * speed + side, Math.sin(a) * speed - 1.8, 20 + Math.random() * 14, e.color || '#ffe28a', 17 + Math.random() * 14, letter, 0.95, 0.018, rand(0.12));
  }
}

function addSlashFan(state, e, count, side) {
  for (let i = 0; i < count; i++) spawn(state, 'slash', e.x + rand(26), e.y + rand(18), side * (1.3 + Math.random() * 2.3), rand(1.2), 10 + Math.random() * 7, e.color || '#fff2a8', 24 + Math.random() * 18, '', 0.94, 0.02, rand(0.18));
}

function addWallBurst(state, e) { addImpactCore(state, e, 7, e.force || 14, e.side || 1); addShockRing(state, e, 22); }
function addPickupBurst(state, e) { for (let i = 0; i < 6; i++) { const a = i * TWO_PI / 6; spawn(state, 'spark', e.x, e.y, Math.cos(a) * 3.2, Math.sin(a) * 3.2, 18, e.color || '#c8fff1', 0, '', 0.94, 0.02, 0); } }
function addNumber(state, e, damage) { spawn(state, 'number', e.x, e.y - 28, 0, -3.6, 28, '#fff4a8', 20 + Math.min(12, damage), String(Math.round(damage)), 0.96, 0.018, 0); }
function addShockRing(state, e, size) { const p = spawn(state, 'ring', e.x, e.y, 0, 0, 16, e.color || '#fff4a8', size, '', 1, 0, 0); if (p) p.maxLife = 16; }
function addCallout(state, e, frame = freshFrameBudget()) { if (!canAddCallout(state, frame)) return; spawn(state, 'callout', e.x, e.y - 62, 0, -1.3, 38, e.color || '#ffef9d', 28, e.text || 'HIT', 0.965, 0.004, 0); frame.callouts++; }

function spawnLetter(state, x, y, vx, vy, life, color, size, text, drag, gravity, spinVel) {
  if (countKind(state, isLetterParticle) >= PARTICLE_BUDGET.maxLetters) recycleOldest(state, isLetterParticle);
  return spawn(state, 'letter', x, y, vx, vy, life, color, size, text, drag, gravity, spinVel);
}

function spawn(state, kind, x, y, vx, vy, life, color, size, text, drag, gravity, spinVel) {
  initPool(state);
  if (state.particles.length >= PARTICLE_BUDGET.maxParticles && !makeRoom(state, kind)) return null;
  const p = state.particlePool.pop() || {};
  p.kind = kind;
  p.x = x;
  p.y = y;
  p.vx = vx;
  p.vy = vy;
  p.life = life;
  p.maxLife = life;
  p.color = color;
  p.size = size || 0;
  p.text = text || '';
  p.drag = drag;
  p.gravity = gravity;
  p.spin = Math.random() * TWO_PI;
  p.spinVel = spinVel || 0;
  state.particles.push(p);
  return p;
}

function makeRoom(state, kind) {
  if (kind === 'letter') return recycleOldest(state, p => !isLetterParticle(p));
  if (kind === 'callout') return recycleOldest(state, p => !isCalloutParticle(p));
  return recycleOldest(state, p => p.kind === 'spark' || p.kind === 'slash');
}

function recycleOldest(state, predicate) {
  const particles = state.particles;
  let index = -1;
  let lowestLife = Infinity;
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if (!predicate(p) || p.life >= lowestLife) continue;
    lowestLife = p.life;
    index = i;
  }
  if (index < 0) return false;
  releaseParticle(state, particles[index]);
  particles[index] = particles[particles.length - 1];
  particles.pop();
  return true;
}

function trimParticles(state) {
  while (state.particles.length > PARTICLE_BUDGET.maxParticles) recycleOldest(state, () => true);
}

function canAddCallout(state, frame) {
  return frame.callouts < 3 && countKind(state, isCalloutParticle) < PARTICLE_BUDGET.maxCallouts;
}

function countKind(state, predicate) {
  let count = 0;
  for (let i = 0; i < state.particles.length; i++) if (predicate(state.particles[i])) count++;
  return count;
}

function initPool(state) {
  state.particles ||= [];
  state.particlePool ||= [];
}

function releaseParticle(state, p) {
  if (state.particlePool.length < PARTICLE_BUDGET.poolLimit) state.particlePool.push(p);
}

function freshFrameBudget() {
  return { events: 0, hitVisuals: 0, callouts: 0 };
}

function rand(n) {
  return (Math.random() * 2 - 1) * n;
}
