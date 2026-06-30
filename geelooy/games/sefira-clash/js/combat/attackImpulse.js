/**
 * B"H
 * Attack body impulse: the fist snaps, the boot commits, the meteor falls.
 *
 * The strike is not only damage after collision. It begins as motion in the
 * attacker: a jab step, a lunging roundhouse, a rising uppercut, a falling kick.
 * This module keeps that motion out of the start gate so combat can be tuned
 * like a living platformer instead of a pile of booleans.
 */
export function applyAttackImpulse(f, id, attack) {
  const charge = attack.rapid ? 0 : attack.charge || 0;
  const aim = attack.aim || { x: f.face || 1, y: 0 };
  const full = attack.fullCharge ? 1 : 0;
  if (id.startsWith('jab')) return jabStep(f, aim, charge, id);
  if (id === 'dashPunch' || id === 'chargePunch') return lunge(f, aim, 1.8 + full * 1.4, charge);
  if (id === 'uppercut') return rise(f, aim, 2.6 + charge * 3.2 + full * 2.5);
  if (id === 'roundhouse') return lunge(f, aim, 2.6 + charge * 2.4 + full * 1.6, charge);
  if (id === 'sweep') return sweepStep(f, aim, charge);
  if (id === 'aerialKick') return airKick(f, aim, charge);
  if (id === 'meteorKick') return meteor(f, aim, charge);
  if (id === 'special' && aim.y > 0.3) f.vy += 3.4 + charge * 2;
}

function jabStep(f, aim, charge, id) {
  const combo = id === 'jab3' ? 1.25 : id === 'jab2' ? 0.9 : 0.65;
  f.vx += (aim.x || f.face || 1) * (combo + charge * 1.2);
  f.vy += Math.min(0.4, (aim.y || 0) * 0.45);
}

function lunge(f, aim, base, charge) {
  f.vx += (aim.x || f.face || 1) * (base + charge * 3.4);
  f.vy += (aim.y || 0) * (1.1 + charge * 2.2);
}

function rise(f, aim, power) {
  f.vy += Math.min(-1.2, (aim.y || -1) * power);
  f.vx += (aim.x || f.face || 1) * 0.75;
}

function sweepStep(f, aim, charge) {
  f.vx += (aim.x || f.face || 1) * (1.55 + charge * 1.8);
  f.vy += 0.35;
}

function airKick(f, aim, charge) {
  f.vx += (aim.x || f.face || 1) * (1.45 + charge * 2.1);
  f.vy += Math.min(-0.55, (aim.y || -0.45) * (1.2 + charge * 1.7));
}

function meteor(f, aim, charge) {
  f.vx += (aim.x || f.face || 1) * 0.65;
  f.vy += Math.max(1.4, (aim.y || 1) * (2.5 + charge * 3.4));
}
