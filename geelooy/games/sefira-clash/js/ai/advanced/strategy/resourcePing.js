/**
 * B"H
 * Resource ping reader.
 *
 * Chapter 82: when a rune or relic appears, the stage rings a bell. Bots hear
 * distance, urgency, and denial before the object becomes forgotten scenery.
 */
export function readResourcePing(bot, state) {
  const ping = state.resourcePing;
  if (!ping || ping.frames <= 0) return { active: false };
  const d = Math.hypot(bot.x - ping.x, (bot.y - ping.y) * 0.5);
  return { ...ping, active: true, distance: d, value: Math.max(0, ping.urgency - d * 0.035) };
}

export function stepResourcePing(state) {
  if (!state.resourcePing) return;
  state.resourcePing.frames--;
  if (state.resourcePing.frames <= 0) state.resourcePing = null;
}

export function setResourcePing(state, type, x, y, urgency = 130) {
  state.resourcePing = { type, x, y, urgency, frames: 360 };
}
