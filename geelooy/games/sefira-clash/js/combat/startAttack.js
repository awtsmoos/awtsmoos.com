import { createAttackState, tickChargeState } from './attackState.js';
import { CHARGE_THRESHOLD } from './chargeAttack.js';
import { readCombatIntent, rememberCombatInput } from './inputIntent.js';
import { pickMove, wantsRapidOverride } from './movePicker.js';
import { maybeThrow } from './throwResolver.js';

/**
 * B"H
 * Combat entry point with honest charge and rapid sparks.
 *
 * Chapter 108: charge is counted after the edge is read, and rapid overlay never
 * drinks from the charge well. A long hold becomes thunder; taps stay sparks.
 */
export function maybeStartAttack(f, input, state = null) {
  f.charge ||= createCharge();
  if (state && maybeThrow(f, state.fighters, input, state.events)) return rememberCombatInput(f, input);
  if (f.stun > 0 || f.blocking || f.landingLag > 0 || f.grabbedBy) return rememberCombatInput(f, input);
  const intent = readCombatIntent(f, input);
  tickChargeState(f, input, intent);
  if (wantsRapidOverride(f, intent)) startRapidOverlay(f, intent);
  if (shouldOverrideCharge(f, intent)) restartPickedMove(f, intent);
  else if (!f.attack) startPickedMove(f, intent);
  rememberCombatInput(f, input);
}

function createCharge() {
  return { punch: 0, kick: 0, special: 0, prev: {}, combo: 0, comboTimer: 0, armedPunch: false, armedKick: false };
}

function shouldOverrideCharge(f, intent) {
  if (!f.attack) return false;
  const punch = intent.releasedPunch && (f.charge?.punch || 0) >= CHARGE_THRESHOLD && f.charge?.armedPunch;
  const kick = intent.releasedKick && (f.charge?.kick || 0) >= CHARGE_THRESHOLD && f.charge?.armedKick;
  return punch || kick;
}

function restartPickedMove(f, intent) {
  f.attack = null;
  f.attackFrame = 0;
  startPickedMove(f, intent);
}

function startRapidOverlay(f, intent) {
  const picked = pickMove(f, { ...intent, forceRapid: true });
  if (!picked?.base || !picked.options?.rapid) return;
  const aim = picked.options?.aim || { x: f.face || 1, y: 0 };
  if (Math.abs(aim.x || 0) > 0.18) f.face = Math.sign(aim.x);
  f.rapidAttack = createAttackState(picked.base, { ...picked.options, charge: 0, rapid: true });
  f.rapidAttackFrame = 0;
  applyAttackImpulse(f, picked.id, f.rapidAttack);
}

function startPickedMove(f, intent) {
  const picked = pickMove(f, intent);
  if (!picked?.base) return;
  const aim = picked.options?.aim || { x: f.face || 1, y: 0 };
  if (Math.abs(aim.x || 0) > 0.18) f.face = Math.sign(aim.x);
  f.attack = createAttackState(picked.base, picked.options);
  f.attackFrame = 0;
  applyAttackImpulse(f, picked.id, f.attack);
}

function applyAttackImpulse(f, id, attack) {
  const charge = attack.rapid ? 0 : attack.charge || 0;
  const full = !!attack.fullCharge;
  const rapid = !!attack.rapid;
  const aim = attack.aim || { x: f.face || 1, y: 0 };
  const surge = full ? 7 : 0;
  const sideMove = rapid ? 0.18 : 1.1 + charge * 2.1 + surge * 0.34;
  const verticalMove = rapid ? 0.08 : 1.05 + charge * 1.75 + surge * 0.28;
  if (id === 'dashPunch' || id === 'chargePunch' || id === 'roundhouse' || id === 'jab1') {
    f.vx += (aim.x || f.face || 1) * sideMove;
    f.vy += (aim.y || 0) * verticalMove;
  }
  if (id === 'uppercut' || id === 'aerialKick') f.vy += Math.min(-0.7, (aim.y || -1) * (rapid ? 0.35 : 2 + charge * 1.6 + surge * 0.25));
  if (id === 'meteorKick') f.vy += Math.max(0.9, (aim.y || 1) * (rapid ? 0.3 : 1.8 + charge * 1.6));
  if (id === 'special' && attack.aim?.y > 0.3) f.vy += 3;
}
