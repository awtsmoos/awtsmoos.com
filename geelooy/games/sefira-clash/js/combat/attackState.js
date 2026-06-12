/**
 * B"H
 * Attack-state creator.
 *
 * Chapter 175: every move is born with the same contract: charge, rapid,
 * directional aim, grab flags, and a Set of souls already struck. This keeps
 * the resolver simple and the combat scroll data-driven.
 */
export function createAttackState(base, options = {}) {
  const charge = Math.max(0, Math.min(1, options.charge || 0));
  const rapid = !!options.rapid;
  const full = charge > 0.92;
  const damageScale = rapid ? 0.44 : full ? 6.4 : 1 + charge * 1.8;
  const knockScale = rapid ? 0.36 : full ? 8.2 : 1 + charge * 1.35;
  return {
    ...base,
    charge,
    rapid,
    fullCharge: full,
    grabKind: options.grabKind || '',
    throwKind: options.throwKind || '',
    aim: options.aim || { x: 1, y: 0 },
    damage: Math.max(1, Math.round(base.damage * damageScale)),
    knock: Math.max(1, base.knock * knockScale),
    radius: base.radius + (rapid ? 8 : charge * (full ? 64 : 28)),
    active: base.active + (rapid ? 7 : full ? 3 : 0),
    startup: Math.max(1, rapid ? 1 : base.startup),
    recovery: Math.max(4, rapid ? 7 : base.recovery),
    angle: options.angle ?? base.angle,
    hasHit: new Set()
  };
}

/** Updates held charge meters without releasing attacks. */
export function tickChargeState(f, input) {
  f.charge ||= {};
  f.charge.punch = input.punch ? Math.min(90, (f.charge.punch || 0) + 1) : f.charge.punch || 0;
  f.charge.kick = input.kick ? Math.min(95, (f.charge.kick || 0) + 1) : f.charge.kick || 0;
  f.charge.special = input.special ? Math.min(90, (f.charge.special || 0) + 1) : 0;
  if (input.punch) f.charge.armedPunch = true;
  if (input.kick) f.charge.armedKick = true;
  f.chargeGlow = Math.max(f.charge.punch || 0, f.charge.kick || 0) / 90;
}

export function consumeCharge(f, kind) {
  const key = kind === 'kick' ? 'kick' : 'punch';
  const frames = f.charge?.[key] || 0;
  f.charge[key] = 0;
  f.charge[`armed${key[0].toUpperCase()}${key.slice(1)}`] = false;
  f.chargeGlow = 0;
  return frames;
}
