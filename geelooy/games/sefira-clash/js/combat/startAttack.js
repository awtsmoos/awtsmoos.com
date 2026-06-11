import { ATTACKS } from '../data/attacks.js';

/**
 * B"H
 * Input-to-move interpreter.
 *
 * Chapter 76: F and G are simple again. Press means strike. The current attack
 * itself prevents spam; no hidden lockout is allowed to swallow the next button
 * and make the player think the game is dead.
 */
export function maybeStartAttack(f, input) {
  f.charge ||= createCharge();
  if (f.stun > 0 || f.blocking || f.landingLag > 0) return remember(f, input);
  tickCharge(f, input);
  if (!f.attack) startPressedAttacks(f, input);
  remember(f, input);
}

function createCharge() {
  return { punch: 0, kick: 0, special: 0, prev: {}, combo: 0, comboTimer: 0 };
}

function tickCharge(f, input) {
  f.charge.comboTimer = Math.max(0, f.charge.comboTimer - 1);
  f.charge.punch = input.punch ? Math.min(70, f.charge.punch + 1) : 0;
  f.charge.kick = input.kick ? Math.min(80, f.charge.kick + 1) : 0;
  f.charge.special = input.special ? Math.min(90, f.charge.special + 1) : 0;
}

function startPressedAttacks(f, input) {
  if (pressed(f, input, 'punch')) return start(f, choosePunch(f), f.charge.punch);
  if (pressed(f, input, 'kick')) return start(f, chooseKick(f), f.charge.kick);
  if (pressed(f, input, 'special')) return start(f, 'special', f.charge.special);
  if (pressed(f, input, 'grab')) return start(f, 'grab', 0);
}

function choosePunch(f) {
  if (f.charge.punch > 34) return 'chargePunch';
  if (Math.abs(f.vx) > 7 && f.grounded) return 'dashPunch';
  if (!f.grounded && f.vy < -3) return 'uppercut';
  return `jab${nextCombo(f)}`;
}

function chooseKick(f) {
  if (!f.grounded && f.vy > 2.5) return 'meteorKick';
  if (!f.grounded) return 'aerialKick';
  if (f.charge.kick > 34) return 'roundhouse';
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
  f.attackFrame = 0;
  applyAttackImpulse(f, id, charge);
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

function pressed(f, input, key) { return !f.charge.prev[key] && input[key]; }

function remember(f, input) {
  f.charge.prev = { punch: !!input.punch, kick: !!input.kick, grab: !!input.grab, special: !!input.special };
}
