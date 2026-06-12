/**
 * B"H
 * Directional attack selection and launch angles.
 *
 * Chapter 231: aim is kavannah. If the player points, that direction rules. If
 * the player does not point, the fighter's face rules. Attack type and launch
 * angle now follow the chosen direction instead of accidental target position.
 */
export function chooseDirectionalMove(button, f, intent, chargeFrames = 0) {
  if (button === 'punch') return choosePunch(f, intent, chargeFrames);
  if (button === 'kick') return chooseKick(f, intent, chargeFrames);
  return 'jab1';
}

export function directionAngle(baseAngle, intent, id) {
  const aim = intent.aim || { x: 1, y: 0 };
  if (id === 'uppercut') return -1.35;
  if (id === 'meteorKick') return 1.42;
  if (aim.down) return id === 'sweep' ? 0.25 : 0.82;
  if (aim.up) return -1.08;
  if (id === 'roundhouse') return -0.34;
  if (id === 'dashPunch' || id === 'chargePunch') return -0.16;
  return baseAngle;
}

export function normalizedAttackAim(f, intent) {
  const aim = intent.aim || {};
  const x = aim.x || f.face || 1;
  const y = aim.up ? -1 : aim.down ? 1 : 0;
  return { x: Math.sign(x) || 1, y, up: y < 0, down: y > 0, side: !!aim.side };
}

function choosePunch(f, intent, chargeFrames) {
  if (intent.airborne && intent.aim.down) return 'meteorKick';
  if (intent.aim.up) return 'uppercut';
  if (intent.aim.down) return chargeFrames > 20 ? 'special' : 'sweep';
  if (chargeFrames > 24) return 'chargePunch';
  if (intent.aim.side || Math.abs(f.vx || 0) > 7) return 'dashPunch';
  return `jab${nextCombo(f)}`;
}

function chooseKick(f, intent, chargeFrames) {
  if (intent.airborne && intent.aim.down) return 'meteorKick';
  if (intent.airborne) return 'aerialKick';
  if (intent.aim.up) return 'uppercut';
  if (intent.aim.down) return 'sweep';
  if (chargeFrames > 24 || intent.aim.side) return 'roundhouse';
  return 'sweep';
}

function nextCombo(f) {
  f.charge ||= {};
  f.charge.comboTimer = Math.max(0, f.charge.comboTimer || 0);
  f.charge.combo = f.charge.comboTimer > 0 ? ((f.charge.combo || 0) % 3) + 1 : 1;
  f.charge.comboTimer = 30;
  return f.charge.combo;
}
