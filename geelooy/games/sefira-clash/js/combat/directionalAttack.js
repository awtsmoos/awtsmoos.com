/**
 * B"H
 * Directional attack selection: punch is grammar, kick is geography.
 *
 * The joystick now speaks clear platform verbs. Up+punch rises, side+punch
 * lunges, neutral punch chains. Down+kicks sweep the ground; air+down kicks fall
 * as meteors. The Awtsmoos separates intent so each button earns its own story.
 */
export function chooseDirectionalMove(button, f, intent, chargeFrames = 0) {
  if (button === 'punch') return choosePunch(f, intent, chargeFrames);
  if (button === 'kick') return chooseKick(f, intent, chargeFrames);
  return 'jab1';
}

export function directionAngle(baseAngle, intent) {
  const aim = intent.aim || { x: 1, y: 0 };
  if (Number.isFinite(aim.angle)) return aim.angle;
  return Math.atan2(aim.y || 0, aim.x || 1) || baseAngle;
}

export function normalizedAttackAim(f, intent) {
  const aim = intent.aim || {};
  const rawX = Number.isFinite(aim.rawX) ? aim.rawX : aim.x;
  const rawY = Number.isFinite(aim.rawY) ? aim.rawY : aim.y;
  const mag = Math.hypot(rawX || 0, rawY || 0);
  if (mag < 0.18) return enrichAim(f.face || 1, 0, rawX || 0, rawY || 0, 0);
  return enrichAim((rawX || 0) / mag, (rawY || 0) / mag, rawX || 0, rawY || 0, Math.min(1, mag));
}

function choosePunch(f, intent, chargeFrames) {
  if (intent.aim.up) return 'uppercut';
  if (intent.aim.down && chargeFrames > 24) return 'chargePunch';
  if (chargeFrames > 28) return 'chargePunch';
  if (intent.aim.side || Math.abs(f.vx || 0) > 7) return 'dashPunch';
  return `jab${nextCombo(f)}`;
}

function chooseKick(f, intent, chargeFrames) {
  if (intent.airborne && intent.aim.down) return 'meteorKick';
  if (intent.airborne || intent.aim.up) return 'aerialKick';
  if (intent.aim.down) return 'sweep';
  if (chargeFrames > 18 || intent.aim.side) return 'roundhouse';
  return 'sweep';
}

function enrichAim(x, y, rawX, rawY, mag) {
  return { x, y, rawX, rawY, mag, angle: Math.atan2(y, x), up: y < -0.42, down: y > 0.42, side: Math.abs(x) > 0.35 };
}

function nextCombo(f) {
  f.charge ||= {};
  f.charge.comboTimer = Math.max(0, f.charge.comboTimer || 0);
  f.charge.combo = f.charge.comboTimer > 0 ? ((f.charge.combo || 0) % 3) + 1 : 1;
  f.charge.comboTimer = 34;
  return f.charge.combo;
}
