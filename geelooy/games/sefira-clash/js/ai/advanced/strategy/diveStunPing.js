/**
 * B"H
 * Dive-stun ping reader.
 *
 * Chapter 99: when a skull is crushed, every bot hears the dizzy bell and rushes
 * toward the helpless fighter before the seven-second mercy expires.
 */
export function readDiveStunPing(bot, state) {
  const ping = state.diveStunPing;
  if (!ping || ping.frames <= 0) return { active: false };
  const victim = state.fighters.find(f => f.id === ping.victimId && !f.dead && !f.hidden && f.diveStunned > 0);
  if (!victim) return { active: false };
  const d = Math.hypot(bot.x - victim.x, (bot.y - victim.y) * 0.5);
  return { active: true, victim, victimId: victim.id, x: victim.x, y: victim.y - 110, distance: d, frames: ping.frames, value: Math.max(0, ping.urgency - d * 0.04 + victim.diveStunned * 0.12) };
}

export function stepDiveStunPing(state) {
  if (!state.diveStunPing) return;
  state.diveStunPing.frames--;
  const v = state.fighters.find(f => f.id === state.diveStunPing.victimId);
  if (state.diveStunPing.frames <= 0 || !v || v.dead || !v.diveStunned) state.diveStunPing = null;
}
