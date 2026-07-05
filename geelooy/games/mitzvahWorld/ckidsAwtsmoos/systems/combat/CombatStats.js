// B"H
/** @file CombatStats.js @description Cheap player and creature combat stat helpers. */
export function playerHp(player) {
  return Number(player?.currentStats?.health ?? player?.hp ?? player?.maxHp ?? 100);
}

export function setPlayerHp(player, value) {
  if (!player) return 0;
  const max = Number(player.currentStats?.maxHealth ?? player.maxHp ?? 100);
  player.currentStats ||= {};
  player.currentStats.maxHealth = max;
  player.currentStats.health = Math.max(0, Math.min(max, Number(value) || 0));
  player.hp = player.currentStats.health;
  return player.hp;
}

export function damagePlayer(player, amount = 0) {
  const damage = Math.max(0, Number(amount) || 0);
  if (!player || damage <= 0) return 0;
  if (typeof player.takeDamage === "function") return player.takeDamage(damage) ?? damage;
  setPlayerHp(player, playerHp(player) - damage);
  return damage;
}

export default { playerHp, setPlayerHp, damagePlayer };
