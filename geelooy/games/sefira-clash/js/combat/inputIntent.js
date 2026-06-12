/**
 * B"H
 * Combat input intent interpreter.
 *
 * Chapter 174: the same two buttons now unfold like many gates. Tap, hold,
 * spam, aim, air state, and grab all become explicit intentions before any
 * attack is created, so combat stops being a single blunt verb.
 */
export function readCombatIntent(f, input) {
  const aim = readAim(f, input);
  const pressed = buttonEdges(f, input);
  const rapid = rapidIntent(f, pressed);
  return {
    aim,
    pressed,
    rapid,
    punchHeld: !!input.punch,
    kickHeld: !!input.kick,
    grabHeld: !!input.grab,
    specialHeld: !!input.special,
    airborne: !f.grounded,
    fastFall: !f.grounded && !!input.down,
    wantsGrab: pressed.grab,
    wantsSpecial: pressed.special,
    releasedPunch: pressed.releasePunch,
    releasedKick: pressed.releaseKick
  };
}

export function readAim(f, input) {
  const rawX = input.aimX || input.x || 0;
  const rawY = input.aimY || input.y || 0;
  const x = Math.abs(rawX) > 0.18 ? Math.sign(rawX) : f.face || 1;
  const y = Math.abs(rawY) > 0.35 ? Math.sign(rawY) : 0;
  return { x, y, up: y < 0, down: y > 0, side: Math.abs(rawX) > 0.45 };
}

function buttonEdges(f, input) {
  f.charge ||= { prev: {} };
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

function rapidIntent(f, pressed) {
  f.rapid ||= { punchTap: 0, kickTap: 0, timer: 0 };
  f.rapid.timer = Math.max(0, f.rapid.timer - 1);
  if (pressed.punch) f.rapid.punchTap = f.rapid.timer > 0 ? f.rapid.punchTap + 1 : 1;
  if (pressed.kick) f.rapid.kickTap = f.rapid.timer > 0 ? f.rapid.kickTap + 1 : 1;
  if (pressed.punch || pressed.kick) f.rapid.timer = 18;
  return {
    punch: f.rapid.punchTap >= 3 && f.rapid.timer > 0,
    kick: f.rapid.kickTap >= 3 && f.rapid.timer > 0
  };
}

export function rememberCombatInput(f, input) {
  f.charge ||= {};
  f.charge.prev = { punch: !!input.punch, kick: !!input.kick, grab: !!input.grab, special: !!input.special };
}
