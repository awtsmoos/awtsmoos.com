import { ATTACKS } from '../data/attacks.js';

/**
 * B"H
 * Input-to-move interpreter.
 *
 * Chapter 6: the Awtsmoos turns one button into many intentions. Tap punch
 * for jabs, run and release for dash punch, hold for charge punch, press while
 * rising for uppercut. Kick becomes sweep, roundhouse, aerial, or meteor by
 * the player's body-state. No extra UI required; feel emerges from context.
 */
export function maybeStartAttack(f, input) {
  f.charge ||= createCharge();
  if (f.stun > 0 || f.blocking) return remember(f, input);
  tickCharge(f, input);
  if (!f.attack) releaseAttacks(f, input);
  remember(f, input);
}

function createCharge() {
  return { punch: 0, kick: 0, special: 0, prev: {}, combo: 0, comboTimer: 0 };
}

function tickCharge(f, input) {
  f.charge.comboTimer = Math.max(0, f.charge.comboTimer - 1);
  if (input.punch) f.charge.punch = Math.min(70, f.charge.punch + 1);
  if (input.kick) f.charge.kick = Math.min(80, f.charge.kick + 1);
  if (input.special) f.charge.special = Math.min(90, f.charge.special + 1);
}

function releaseAttacks(f, input) {
  if (released(f, input, 'punch')) start(f, choosePunch(f), f.charge.punch);
  else if (released(f, input, 'kick')) start(f, chooseKick(f), f.charge.kick);
  else if (released(f, input, 'special')) start(f, 'special', f.charge.special);
  else if (pressed(f, input, 'grab')) start(f, 'grab', 0);
}

function choosePunch(f) {
  if (f.charge.punch > 28) return 'chargePunch';
  if (Math.abs(f.vx) > 7) return 'dashPunch';
  if (f.vy < -4 || !f.grounded) return 'uppercut';
  return `jab${nextCombo(f)}`;
}

function chooseKick(f) {
  if (!f.grounded && f.vy > 2.5) return 'meteorKick';
  if (!f.grounded) return 'aerialKick';
  if (f.charge.kick > 30) return 'roundhouse';
  if (Math.abs(f.vx) < 2) return 'sweep';
  return 'roundhouse';
}

function start(f, id, chargeFrames) {
  const base = ATTACKS[id];
  if (!base) return;
  const charge = Math.max(0, Math.min(1, chargeFrames / 55));
  f.attack = {
    ...base,
    charge,
    damage: Math.round(base.damage + base.damage * charge * 1.15),
    knock: base.knock + base.knock * charge * 0.85,
    radius: base.radius + charge * 24,
    hasHit: new Set()
  };
  applyAttackImpulse(f, id, charge);
  f.attackFrame = 0;
  clearCharge(f, id);
}

function applyAttackImpulse(f, id, charge) {
  if (id === 'dashPunch') f.vx += f.face * (2.6 + charge * 3.5);
  if (id === 'uppercut') f.vy -= 2.4 + charge * 1.8;
  if (id === 'meteorKick') f.vy += 1.8;
}

function nextCombo(f) {
  f.charge.combo = f.charge.comboTimer > 0 ? (f.charge.combo % 3) + 1 : 1;
  f.charge.comboTimer = 30;
  return f.charge.combo;
}

function clearCharge(f, id) {
  if (id.includes('jab') || id.includes('Punch') || id === 'uppercut') f.charge.punch = 0;
  else if (id.includes('Kick') || id === 'roundhouse' || id === 'sweep') f.charge.kick = 0;
  else f.charge[id] = 0;
}

function released(f, input, key) { return f.charge.prev[key] && !input[key]; }
function pressed(f, input, key) { return !f.charge.prev[key] && input[key]; }

function remember(f, input) {
  f.charge.prev = { punch: !!input.punch, kick: !!input.kick, grab: !!input.grab, special: !!input.special };
}
