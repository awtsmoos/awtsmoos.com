import { aimForAttack, rememberAttackAim } from '../controls/aimMemory.js';

/**
 * B"H
 * Combat input intent interpreter with mirrored aim memory.
 *
 * Chapter 24: click-aim may remain after the cursor is gone. If the fighter
 * turns and the hand attacks again, the old angle is reflected through the
 * body: up stays up, down stays down, forward becomes new-forward.
 */
export function readCombatIntent(f, input) {
  f.charge ||= { prev: {} };
  const liveAim = readAim(f, input);
  const pressed = buttonEdges(f, input);
  rememberPressAim(f, pressed, liveAim);
  const rapid = rapidIntent(f, pressed);
  return {
    aim: attackAim(f, input, liveAim), liveAim, pressed, rapid,
    rapidPunch: !!input.rapidPunch || rapid.punch,
    rapidKick: !!input.rapidKick || rapid.kick,
    aiChargePunch: !!input.chargePunch,
    aiChargeKick: !!input.chargeKick,
    punchHeld: !!input.punch, kickHeld: !!input.kick,
    grabHeld: !!input.grab, specialHeld: !!input.special,
    airborne: !f.grounded, fastFall: !f.grounded && !!input.down,
    wantsGrab: pressed.grab, wantsSpecial: pressed.special,
    releasedPunch: pressed.releasePunch, releasedKick: pressed.releaseKick
  };
}

export function readAim(f, input) {
  const rawX = number(input.aimX ?? input.x);
  const rawY = number(input.aimY ?? input.y);
  const mag = Math.hypot(rawX, rawY);
  if (mag < 0.18) return enrichAim(f.face || 1, 0, rawX, rawY, 0);
  return enrichAim(rawX / mag, rawY / mag, rawX, rawY, Math.min(1, mag));
}

function enrichAim(x, y, rawX, rawY, mag) {
  return { x, y, rawX, rawY, mag, angle: Math.atan2(y, x), up: y < -0.42, down: y > 0.42, side: Math.abs(x) > 0.35 };
}

function buttonEdges(f, input) {
  const prev = f.charge.prev || {};
  return {
    punch: !prev.punch && !!input.punch,
    kick: !prev.kick && !!input.kick,
    grab: !prev.grab && !!input.grab,
    special: !prev.special && !!input.special,
    releasePunch: !!prev.punch && !input.punch,
    releaseKick: !!prev.kick && !input.kick
  };
}

function rememberPressAim(f, pressed, aim) {
  f.charge.pressAim ||= {};
  if (pressed.punch) { f.charge.pressAim.punch = { ...aim }; rememberAttackAim(f, 'punch', aim); }
  if (pressed.kick) { f.charge.pressAim.kick = { ...aim }; rememberAttackAim(f, 'kick', aim); }
  if (pressed.grab) f.charge.pressAim.grab = { ...aim };
  if (pressed.special) f.charge.pressAim.special = { ...aim };
}

function attackAim(f, input, liveAim) {
  if (input.kick) return aimForAttack(f, 'kick', f.charge?.pressAim?.kick || liveAim);
  if (input.punch) return aimForAttack(f, 'punch', f.charge?.pressAim?.punch || liveAim);
  if (input.grab && f.charge?.pressAim?.grab) return f.charge.pressAim.grab;
  if (input.special && f.charge?.pressAim?.special) return f.charge.pressAim.special;
  return liveAim;
}

function rapidIntent(f, pressed) {
  f.rapid ||= { punchTap: 0, kickTap: 0, timer: 0 };
  f.rapid.timer = Math.max(0, f.rapid.timer - 1);
  if (pressed.punch) f.rapid.punchTap = f.rapid.timer > 0 ? f.rapid.punchTap + 1 : 1;
  if (pressed.kick) f.rapid.kickTap = f.rapid.timer > 0 ? f.rapid.kickTap + 1 : 1;
  if (pressed.punch || pressed.kick) f.rapid.timer = 18;
  return { punch: f.rapid.punchTap >= 2 && f.rapid.timer > 0, kick: f.rapid.kickTap >= 3 && f.rapid.timer > 0 };
}

export function rememberCombatInput(f, input) {
  f.charge ||= {};
  f.charge.prev = { punch: !!input.punch, kick: !!input.kick, grab: !!input.grab, special: !!input.special };
}

function number(value) { return Number.isFinite(Number(value)) ? Number(value) : 0; }
