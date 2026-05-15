/**
 * B\"H
 * @file HealthBarPayload.js
 * @description
 * Data-only UI health bar payloads for player and klipah targets.
 */

export function makeHealthBarPayload({ id, name, hp, maxHp, type = "entity" } = {}) {
  const safeMax = Math.max(1, Number(maxHp) || 1);
  const safeHp = Math.max(0, Math.min(safeMax, Number(hp) || 0));

  return {
    id,
    name: name || id || "Entity",
    type,
    hp: safeHp,
    maxHp: safeMax,
    percent: Math.round((safeHp / safeMax) * 100)
  };
}
