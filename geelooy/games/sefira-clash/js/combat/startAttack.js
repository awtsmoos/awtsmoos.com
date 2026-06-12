import { createAttackState, tickChargeState } from './attackState.js';
import { readCombatIntent, rememberCombatInput } from './inputIntent.js';
import { pickMove } from './movePicker.js';
import { maybeThrow } from './throwResolver.js';

/**
 * B"H
 * Combat entry point.
 *
 * Chapter 182: tap, spam, hold, aim, release, grab, and throw all enter one
 * gate. The body may charge while walking; rapid tapping becomes flurry; grab
 * becomes carry; aim becomes directional violence.
 */
export function maybeStartAttack(f, input, state = null) {
  f.charge ||= createCharge();
  if (state && maybeThrow(f, state.fighters, input, state.events)) return rememberCombatInput(f, input);
  if (f.stun > 0 || f.blocking || f.landingLag > 0 || f.grabbedBy) return rememberCombatInput(f, input);
  tickChargeState(f, input);
  if (!f.attack) startPickedMove(f, readCombatIntent(f, input));
  rememberCombatInput(f, input);
}

function createCharge() {
  return { punch: 0, kick: 0, special: 0, prev: {}, combo: 0, comboTimer: 0, armedPunch: false, armedKick: false };
}

function startPickedMove(f, intent) {
  const picked = pickMove(f, intent);
  if (!picked || !picked.base) return;
  f.face = picked.options?.aim?.x || f.face || 1;
  f.attack = createAttackState(picked.base, picked.options);
  f.attackFrame = 0;
  applyAttackImpulse(f, picked.id, f.attack);
}

function applyAttackImpulse(f, id, attack) {
  const charge = attack.charge || 0;
  const full = !!attack.fullCharge;
  const aim = attack.aim || { x: f.face || 1, y: 0 };
  const surge = full ? 9 : 0;
  if (id === 'dashPunch' || id === 'chargePunch') f.vx += aim.x * (2.6 + charge * 4 + surge);
  if (id === 'uppercut') f.vy -= 2.4 + charge * 2.2 + surge * 0.3;
  if (id === 'meteorKick') f.vy += 1.8 + charge * 2;
  if (id === 'roundhouse' && full) f.vx += aim.x * 7;
  if (id === 'special' && attack.aim?.y > 0.3) f.vy += 3;
}
