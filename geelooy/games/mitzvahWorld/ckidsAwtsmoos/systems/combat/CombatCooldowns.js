// B"H
/** @file CombatCooldowns.js @description Per-target retaliation cooldowns. */
export function cooldownReady(target, key, cooldownMs, now = Date.now()) {
  target.__combatCooldowns ||= {};
  const last = Number(target.__combatCooldowns[key] || 0);
  if (now - last < cooldownMs) return false;
  target.__combatCooldowns[key] = now;
  return true;
}

export default { cooldownReady };
