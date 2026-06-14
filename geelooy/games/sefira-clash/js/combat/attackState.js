/**
 * B"H
 * Attack-state creator and honest charge meter.
 *
 * Chapter 107: tap is a spark, rapid is a rain of sparks, and charge is only a
 * vow held across time. The Awtsmoos separates them so frantic tapping never
 * secretly becomes thunder.
 */
const HOLD_ARM_FRAMES = 10;

export function createAttackState(base, options = {}) {
  const charge = Math.max(0, Math.min(1, options.charge || 0));
  const rapid = !!options.rapid;
  const full = !rapid && charge > 0.92;
  const damageScale = rapid ? 0.38 : full ? 5.4 : 1 + charge * 1.35;
  const knockScale = rapid ? 0.32 : full ? 6.2 : 1 + charge * 1.05;
  return {
    ...base,
    charge: rapid ? 0 : charge,
    rapid,
    fullCharge: full,
    grabKind: options.grabKind || '',
    throwKind: options.throwKind || '',
    aim: options.aim || { x: 1, y: 0 },
    damage: Math.max(1, Math.round(base.damage * damageScale)),
    knock: Math.max(1, base.knock * knockScale),
    radius: base.radius + (rapid ? 6 : charge * (full ? 44 : 22)),
    active: base.active + (rapid ? 5 : full ? 2 : 0),
    startup: Math.max(1, rapid ? 1 : base.startup),
    recovery: Math.max(4, rapid ? 6 : base.recovery),
    angle: options.angle ?? base.angle,
    hasHit: new Set()
  };
}

export function tickChargeState(f, input, intent = null) {
  f.charge ||= { prev: {} };
  tickButton(f, input, intent, 'punch', 'armedPunch');
  tickButton(f, input, intent, 'kick', 'armedKick');
  f.charge.special = input.special ? Math.min(90, (f.charge.special || 0) + 1) : 0;
  f.chargeGlow = Math.max(f.charge.punch || 0, f.charge.kick || 0) / 90;
}

function tickButton(f, input, intent, key, armedKey) {
  const held = !!input[key];
  const rapid = key === 'punch' ? intent?.rapidPunch || input.rapidPunch : intent?.rapidKick || input.rapidKick;
  if (!held || rapid) {
    f.charge[key] = 0;
    f.charge[armedKey] = false;
    return;
  }
  f.charge[key] = Math.min(95, (f.charge[key] || 0) + 1);
  f.charge[armedKey] = f.charge[key] >= HOLD_ARM_FRAMES;
}

export function consumeCharge(f, kind) {
  const key = kind === 'kick' ? 'kick' : 'punch';
  const frames = f.charge?.[key] || 0;
  f.charge[key] = 0;
  f.charge[`armed${key[0].toUpperCase()}${key.slice(1)}`] = false;
  f.chargeGlow = 0;
  return frames;
}
