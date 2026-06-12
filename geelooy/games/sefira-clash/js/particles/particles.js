/**
 * B"H
 * Pooled magical impact-particle simulation.
 *
 * Chapter 30: the hit point becomes a gate of letters. Every strike rips open
 * fast sparks, Hebrew glyphs, slash marks, and a shock ring, yet the vessel is
 * pooled so the phone is not asked to mint infinite objects in a single breath.
 */
const MAX_PARTICLES = 260;
const POOL_LIMIT = 420;
const TWO_PI = Math.PI * 2;
const IMPACT_LETTERS = ['א', 'ש', 'כ', 'ד', 'מ', 'נ', 'צ', 'ר', 'ל'];
const FALL_LETTERS = ['נ', 'פ', 'ל', 'ה', 'א', 'ש'];

export function addEventParticles(state) {
  initPool(state);
  const events = state.events;
  for (let i = 0; i < events.length; i++) routeEvent(state, events[i]);
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

function routeEvent(state, e) {
  if (e.type === 'hit') addHitBurst(state, e);
  else if (e.type === 'wall') addWallBurst(state, e);
  else if (e.type === 'fall') addFallBurst(state, e);
  else if (e.type === 'pickup') addPickupBurst(state, e);
  else if (e.type === 'narrative') addCallout(state, e);
}

function addHitBurst(state, e) {
  const damage = e.damage || 1;
  const force = e.force || damage;
  const big = e.fullCharge || e.shockwave || force > 34 || damage > 20;
  const side = e.side || Math.sign(e.dirX || 1) || 1;
  addImpactCore(state, e, big, force, side);
  addHebrewSpray(state, e, big ? 14 : 8, IMPACT_LETTERS, force, side);
  addSlashFan(state, e, big ? 8 : 4, side);
  addNumber(state, e, damage);
  addShockRing(state, e, big ? 58 : 32);
  if (damage >= 24 || big) addCallout(state, { ...e, text: big ? 'מכה!' : 'HIT' });
}

function addImpactCore(state, e, big, force, side) {
  const count = big ? 34 : 20;
  for (let i = 0; i < count; i++) {
    const a = -0.25 * side + (Math.random() - 0.5) * 2.7;
    const speed = 3.2 + Math.random() * (big ? 10 : 6) + force * 0.055;
    spawn(state, 'spark', e.x, e.y, Math.cos(a) * speed * side, Math.sin(a) * speed, 12 + Math.random() * 12, e.color || '#f8d66a', 0, '', 0.91, 0.035, Math.random() * 0.4);
  }
}

function addFallBurst(state, e) {
  const dx = -(e.dirX || 0);
  const dy = -(e.dirY || 0);
  const base = Math.atan2(dy, dx);
  for (let i = 0; i < 76; i++) {
    const a = base + (Math.random() - 0.5) * 1.35;
    const speed = 5.5 + Math.random() * 12.5;
    spawn(state, 'spark', e.x, e.y, Math.cos(a) * speed, Math.sin(a) * speed, 28 + Math.random() * 24, e.color || '#ff8a6b', 0, '', 0.925, 0.015, Math.random() * 0.4);
  }
  addHebrewSpray(state, e, 22, FALL_LETTERS, 70, Math.sign(dx || 1));
  addShockRing(state, e, 98);
  addCallout(state, { ...e, text: e.text || 'OUT' });
}

function addHebrewSpray(state, e, count, letters, force, side) {
  for (let i = 0; i < count; i++) {
    const letter = e.letter && i === 0 ? e.letter : letters[(i + Math.floor(Math.random() * letters.length)) % letters.length];
    const a = Math.random() * TWO_PI;
    const speed = 1.8 + Math.random() * 5 + force * 0.025;
    spawn(state, 'letter', e.x + rand(16), e.y + rand(12), Math.cos(a) * speed + side * 1.2, Math.sin(a) * speed - 2.2, 22 + Math.random() * 18, e.color || '#ffe28a', 18 + Math.random() * 18, letter, 0.95, 0.018, rand(0.12));
  }
}

function addSlashFan(state, e, count, side) {
  for (let i = 0; i < count; i++) {
    spawn(state, 'slash', e.x + rand(30), e.y + rand(22), side * (1.5 + Math.random() * 3), rand(1.5), 12 + Math.random() * 8, e.color || '#fff2a8', 28 + Math.random() * 24, '', 0.94, 0.02, rand(0.18));
  }
}

function addWallBurst(state, e) { addImpactCore(state, e, false, e.force || 14, e.side || 1); addShockRing(state, e, 26); }
function addPickupBurst(state, e) { for (let i = 0; i < 10; i++) { const a = i * TWO_PI / 10; spawn(state, 'spark', e.x, e.y, Math.cos(a) * 3.2, Math.sin(a) * 3.2, 18, e.color || '#c8fff1', 0, '', 0.94, 0.02, 0); } }
function addNumber(state, e, damage) { spawn(state, 'number', e.x, e.y - 28, 0, -3.6, 34, '#fff4a8', 23 + Math.min(16, damage), String(Math.round(damage)), 0.96, 0.018, 0); }
function addShockRing(state, e, size) { const p = spawn(state, 'ring', e.x, e.y, 0, 0, 18, e.color || '#fff4a8', size, '', 1, 0, 0); p.maxLife = 18; }
function addCallout(state, e) { spawn(state, 'callout', e.x, e.y - 62, 0, -1.3, 46, e.color || '#ffef9d', 30, e.text || 'HIT', 0.965, 0.004, 0); }

function spawn(state, kind, x, y, vx, vy, life, color, size, text, drag, gravity, spinVel) {
  initPool(state);
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

function initPool(state) {
  state.particles ||= [];
  state.particlePool ||= [];
}

function releaseParticle(state, p) {
  if (state.particlePool.length < POOL_LIMIT) state.particlePool.push(p);
}

function trimParticles(state) {
  while (state.particles.length > MAX_PARTICLES) releaseParticle(state, state.particles.shift());
}

function rand(n) {
  return (Math.random() * 2 - 1) * n;
}
