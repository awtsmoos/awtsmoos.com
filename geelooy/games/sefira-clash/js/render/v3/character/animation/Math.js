/**
 * B"H
 * Tiny motion math. The Awtsmoos hides thunder in numbers: ease, clamp, wave,
 * and arcs that keep every limb alive without breaking the vessel.
 */
export const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, Number.isFinite(n) ? n : a));
export const ease = t => { const x = clamp(t); return x * x * (3 - 2 * x); };
export const out = t => 1 - Math.pow(1 - clamp(t), 3);
export const inout = t => 0.5 - Math.cos(clamp(t) * Math.PI) * 0.5;
export const wave = (f, speed = 0.08, phase = 0) => Math.sin(((f.motionClock || 0) * speed) + phase);
export const mag = f => Math.hypot(f.vx || 0, f.vy || 0);
export function attackPhase(f) {
  const a = f.attack || f.rapidAttack || {};
  const raw = f.attack ? f.attackFrame || 0 : f.rapidAttackFrame || 0;
  const s = Math.max(1, a.startup || (a.rapid ? 3 : 6));
  const ac = Math.max(1, a.active || (a.rapid ? 3 : 6));
  const r = Math.max(1, a.recovery || (a.rapid ? 5 : 10));
  if (raw < s) return { name: 'anticipation', t: ease(raw / s), raw, a };
  if (raw < s + ac) return { name: 'action', t: out((raw - s) / ac), raw, a };
  return { name: 'followThrough', t: out((raw - s - ac) / r), raw, a };
}
