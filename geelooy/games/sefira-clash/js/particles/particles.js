/**
 * B"H
 * Fast impact-particle simulation for readable mystical violence.
 *
 * Chapter 46: the hit is no longer a number. It is a rupture: sparks, rings,
 * trails, Hebrew seals, danger smoke, combo flashes, and a brief written cry
 * from the wound. The Awtsmoos spends particles like royal coins, capped and
 * compacted, so beauty never murders the frame.
 */
const MAX_PARTICLES = 360;
const TWO_PI = Math.PI * 2;
const LETTERS = ['כ', 'א', 'ש', 'ד', 'ן', 'ת', 'צ', 'מ'];

export function addEventParticles(state) {
  const events = state.events;
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (e.type === 'hit') addHitBurst(state, e);
    else if (e.type === 'pickup') addPickupBurst(state, e);
    else if (e.type === 'narrative') addCallout(state, e);
  }
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
    p.vx *= p.drag || 0.985;
    p.vy = p.vy * (p.drag || 0.985) + (p.gravity || 0.06);
    p.spin = (p.spin || 0) + (p.rot || 0);
    p.life--;
    if (p.life > 0) particles[write++] = p;
  }
  particles.length = write;
}

function addHitBurst(state, e) {
  const damage = e.damage || 1;
  const charge = e.charge || 0;
  const force = e.force || damage;
  const count = Math.min(42, 10 + Math.ceil(damage * 0.9) + Math.ceil(charge * 12));
  addSparks(state, e, count, force);
  addLetters(state, e, Math.min(22, 5 + Math.ceil(damage / 2.1)));
  addNumber(state, e, damage);
  addShockRing(state, e, damage);
  addSpeedTrail(state, e, Math.min(14, Math.ceil(force / 2)));
  if (damage >= 14 || e.koDanger) addCallout(state, { ...e, text: e.koDanger ? 'סכנה' : 'שבירה' });
}

function addSparks(state, e, count, force) {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * TWO_PI + Math.random() * 0.22;
    const speed = 3.6 + Math.random() * 6.8 + force * 0.09;
    push(state, { x: e.x, y: e.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
      life: 18 + Math.random() * 18, color: e.color || '#f8d66a', kind: 'spark', drag: 0.93, gravity: 0.08 });
  }
}

function addLetters(state, e, count) {
  for (let i = 0; i < count; i++) {
    const letter = e.letter || LETTERS[(i + Math.floor(Math.random() * LETTERS.length)) % LETTERS.length];
    push(state, { kind: 'letter', text: letter, x: e.x + Math.random() * 72 - 36, y: e.y + Math.random() * 46 - 23,
      vx: Math.random() * 8 - 4, vy: -4.5 - Math.random() * 6, life: 36 + Math.random() * 28,
      color: e.color || '#ffe28a', size: 22 + Math.random() * 26, rot: Math.random() * 0.2 - 0.1, drag: 0.962, gravity: 0.025 });
  }
}

function addNumber(state, e, damage) {
  push(state, { kind: 'number', text: String(Math.round(damage)), x: e.x, y: e.y - 28,
    vx: 0, vy: -4.8, life: 58, color: '#fff4a8', size: 32 + Math.min(32, damage), drag: 0.97, gravity: 0.035 });
}

function addShockRing(state, e, damage) {
  push(state, { kind: 'ring', x: e.x, y: e.y, vx: 0, vy: 0, life: 20,
    color: e.color || '#fff4a8', size: 36 + damage * 3.2, maxLife: 20, drag: 1, gravity: 0 });
}

function addSpeedTrail(state, e, count) {
  const side = e.side || 1;
  for (let i = 0; i < count; i++) {
    push(state, { kind: 'slash', x: e.x - side * i * 18, y: e.y + Math.random() * 36 - 18,
      vx: -side * (1.2 + i * 0.05), vy: Math.random() * 1.2 - 0.6, life: 16 + i,
      color: e.color || '#fff4a8', size: 44 + i * 6, drag: 0.94, gravity: 0 });
  }
}

function addCallout(state, e) {
  push(state, { kind: 'callout', text: e.text || 'נקמה', x: e.x, y: e.y - 70,
    vx: 0, vy: -2.2, life: 78, color: e.color || '#ffef9d', size: 34, drag: 0.975, gravity: 0.01 });
}

function addPickupBurst(state, e) {
  for (let i = 0; i < 16; i++) {
    const a = i * TWO_PI / 16;
    push(state, { x: e.x, y: e.y, vx: Math.cos(a) * 3.2, vy: Math.sin(a) * 3.2,
      life: 28, color: e.color || '#c8fff1', kind: 'spark', drag: 0.95, gravity: 0.03 });
  }
  addCallout(state, { ...e, text: e.letter || 'אור' });
}

function push(state, particle) {
  state.particles.push(particle);
  if (state.particles.length > MAX_PARTICLES) state.particles.shift();
}

function trimParticles(state) {
  const overflow = state.particles.length - MAX_PARTICLES;
  if (overflow > 0) state.particles.splice(0, overflow);
}
