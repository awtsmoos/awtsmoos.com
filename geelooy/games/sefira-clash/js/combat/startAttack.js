import { applyAttackImpulse } from './attackImpulse.js';
import { createAttackState, tickChargeState } from './attackState.js';
import { CHARGE_THRESHOLD } from './chargeAttack.js';
import { readCombatIntent, rememberCombatInput } from './inputIntent.js';
import { pickMove, wantsRapidOverride } from './movePicker.js';
import { maybeThrow } from './throwResolver.js';

/**
 * B"H
 * Combat entry point with honest charge, rapid sparks, and split body impulse.
 *
 * The old gate still chooses moves, but the body surge now lives in its own
 * vessel. Punch starts quicker. Kick commits wider. Adventure enemies can be
 * kicked off ledges, uppercut into the sky, swept low, or meteor-crushed.
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
  launchAttack(f, picked, 'rapidAttack', 'rapidAttackFrame');
}

function startPickedMove(f, intent) {
  const picked = pickMove(f, intent);
  if (!picked?.base) return;
  launchAttack(f, picked, 'attack', 'attackFrame');
}

function launchAttack(f, picked, slot, frameKey) {
  const aim = picked.options?.aim || { x: f.face || 1, y: 0 };
  if (Math.abs(aim.x || 0) > 0.18) f.face = Math.sign(aim.x);
  f[slot] = createAttackState(picked.base, picked.options);
  f[frameKey] = 0;
  applyAttackImpulse(f, picked.id, f[slot]);
}
