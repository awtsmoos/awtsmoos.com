import { createAttackState, tickChargeState } from './attackState.js';
import { CHARGE_THRESHOLD } from './chargeAttack.js';
import { readCombatIntent, rememberCombatInput } from './inputIntent.js';
import { pickMove, wantsRapidOverride } from './movePicker.js';
import { maybeThrow } from './throwResolver.js';

/**
 * B"H
 * Combat entry point with overlay rapid strikes.
 *
 * Chapter 39: the main attack is no longer killed by a rapid tap. A charged
 * punch remains a gathering mountain; a rapid re-press becomes a small extra
 * spark layered beside it. The Awtsmoos keeps both vessels distinct: thunder
 * for hold, sparks for taps, never confusion between them.
 */
export function maybeStartAttack(f, input, state = null) {
  f.charge ||= createCharge();
  if (state && maybeThrow(f, state.fighters, input, state.events)) return rememberCombatInput(f, input);
  if (f.stun > 0 || f.blocking || f.landingLag > 0 || f.grabbedBy) return rememberCombatInput(f, input);
  tickChargeState(f, input);
  const intent = readCombatIntent(f, input);
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
  const punch = intent.releasedPunch && (f.charge?.punch || 0) >= CHARGE_THRESHOLD;
  const kick = intent.releasedKick && (f.charge?.kick || 0) >= CHARGE_THRESHOLD;
  return punch || kick;
}

function restartPickedMove(f, intent) {
  f.attack = null;
  f.attackFrame = 0;
  startPickedMove(f, intent);
}

function startRapidOverlay(f, intent) {
  const picked = pickMove(f, intent);
  if (!picked?.base || !picked.options?.rapid) return;
  const aim = picked.options?.aim || { x: f.face || 1, y: 0 };
  if (Math.abs(aim.x || 0) > 0.18) f.face = Math.sign(aim.x);
  f.rapidAttack = createAttackState(picked.base, { ...picked.options, rapid: true });
  f.rapidAttackFrame = 0;
  applyAttackImpulse(f, picked.id, f.rapidAttack);
}

function startPickedMove(f, intent) {
  const picked = pickMove(f, intent);
  if (!picked || !picked.base) return;
  const aim = picked.options?.aim || { x: f.face || 1, y: 0 };
  if (Math.abs(aim.x || 0) > 0.18) f.face = Math.sign(aim.x);
  f.attack = createAttackState(picked.base, picked.options);
  f.attackFrame = 0;
  applyAttackImpulse(f, picked.id, f.attack);
}

function applyAttackImpulse(f, id, attack) {
  const charge = attack.charge || 0;
  const full = !!attack.fullCharge;
  const rapid = !!attack.rapid;
  const aim = attack.aim || { x: f.face || 1, y: 0 };
  const surge = full ? 9 : 0;
  const sideMove = rapid ? 0.32 : 1.4 + charge * 3 + surge * 0.45;
  const verticalMove = rapid ? 0.18 : 1.3 + charge * 2.4 + surge * 0.35;
  if (id === 'dashPunch' || id === 'chargePunch' || id === 'roundhouse' || id === 'jab1') {
    f.vx += (aim.x || f.face || 1) * sideMove;
    f.vy += (aim.y || 0) * verticalMove;
  }
  if (id === 'uppercut' || id === 'aerialKick') f.vy += Math.min(-1.1, (aim.y || -1) * (rapid ? 0.65 : 2.5 + charge * 2.2 + surge * 0.35));
  if (id === 'meteorKick') f.vy += Math.max(1.2, (aim.y || 1) * (rapid ? 0.55 : 2.1 + charge * 2));
  if (id === 'special' && attack.aim?.y > 0.3) f.vy += 3;
}
