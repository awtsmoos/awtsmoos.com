/**
 * B"H
 * Fast impact-particle simulation tuned for Android.
 *
 * Chapter 252: particles no longer shift the whole array each time a spark is
 * born. Bursts may arrive like a storm, but trimming happens once, at the end,
 * and step compaction keeps the vessel tight without allocation panic.
 */
const MAX_PARTICLES = 128;
const TWO_PI = Math.PI * 2;
const LETTERS = ['כ', 'א', 'ש', 'ד', 'מ'];

export function addEventParticles(state) {
  const events = state.events;
  for (let i = 0; i < events.length; i++) routeEvent(state, events[i]);
  events.length = 0;
  trimParticles(state);
}

export function stepParticles(state) {
  const particles = state.particles;
  let write = 0;
  for (let read = 0; read < particles.length; read++) {
    const p = particles[read];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= p.drag || 0.97;
    p.vy = p.vy * (p.drag || 0.97) + (p.gravity || 0.04);
    p.life--;
    if (p.life > 0) particles[write++] = p;
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
  const big = e.fullCharge || e.shockwave || force > 36;
  addSparks(state, e, big ? 18 : 10, force);
  addLetters(state, e, big ? 5 : 2);
  addNumber(state, e, damage);
  addShockRing(state, e, damage * (big ? 1.2 : 0.8));
  if (damage >= 24 || big) addCallout(state, { ...e, text: big ? 'MAX' : 'HIT' });
}

function addWallBurst(state, e) { addSparks(state, e, 12, e.force || 12); addShockRing(state, e, 14); }
function addFallBurst(state, e) { addSparks(state, e, 14, e.force || 20); addCallout(state, { ...e, text: 'OUT' }); }

function addSparks(state, e, count, force) {
  for (let i = 0; i < count; i++) {
    const a = i / count * TWO_PI + Math.random() * 0.2;
    const speed = 2.5 + Math.random() * 4 + force * 0.04;
    push(state, particle('spark', e.x, e.y, Math.cos(a) * speed, Math.sin(a) * speed, 12 + Math.random() * 10, e.color || '#f8d66a', 0, '', 0.92, 0.05));
  }
}

function addLetters(state, e, count) {
  for (let i = 0; i < count; i++) {
    const letter = e.letter || LETTERS[(i + Math.floor(Math.random() * LETTERS.length)) % LETTERS.length];
    push(state, particle('letter', e.x + Math.random() * 42 - 21, e.y + Math.random() * 26 - 13,
      Math.random() * 4 - 2, -2.8 - Math.random() * 3, 22 + Math.random() * 14,
      e.color || '#ffe28a', 20 + Math.random() * 12, letter, 0.955, 0.02));
  }
}

function addNumber(state, e, damage) {
  push(state, particle('number', e.x, e.y - 24, 0, -3.4, 34, '#fff4a8', 24 + Math.min(14, damage), String(Math.round(damage)), 0.96, 0.025));
}

function addShockRing(state, e, damage) {
  const p = particle('ring', e.x, e.y, 0, 0, 12, e.color || '#fff4a8', 26 + damage * 1.4, '', 1, 0);
  p.maxLife = 12;
  push(state, p);
}

function addCallout(state, e) {
  push(state, particle('callout', e.x, e.y - 60, 0, -1.6, 36, e.color || '#ffef9d', 26, e.text || 'HIT', 0.965, 0.005));
}

function addPickupBurst(state, e) {
  for (let i = 0; i < 6; i++) {
    const a = i * TWO_PI / 6;
    push(state, particle('spark', e.x, e.y, Math.cos(a) * 2.4, Math.sin(a) * 2.4, 18, e.color || '#c8fff1', 0, '', 0.94, 0.02));
  }
}

function particle(kind, x, y, vx, vy, life, color, size = 0, text = '', drag = 0.97, gravity = 0.04) {
  return { kind, x, y, vx, vy, life, maxLife: life, color, size, text, drag, gravity };
}

function push(state, p) { state.particles.push(p); }

function trimParticles(state) {
  const overflow = state.particles.length - MAX_PARTICLES;
  if (overflow > 0) state.particles.splice(0, overflow);
}
