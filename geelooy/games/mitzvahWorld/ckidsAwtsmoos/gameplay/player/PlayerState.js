// B"H
export function createPlayerState() {
  return {
    level:1,
    xp:0,
    xpToLevel:100,
    health:100,
    maxHealth:100,
    stamina:100,
    maxStamina:100,
    coins:20,
    stats:{ strength:5, focus:4, stamina:5, spirit:3 },
    equipment:{ weapon:null, trinket:null },
    learnedAbilities:["quick_strike"],
    actionBar:["melee_attack", "quick_strike", "block", "bag", "interact"],
    position:{ x:0, z:0 },
    targetId:null,
    lastDamageTaken:0
  };
}

export function awardXp(player, amount) {
  player.xp += Math.max(0, Number(amount) || 0);
  const levelUps = [];
  while (player.xp >= player.xpToLevel) {
    player.xp -= player.xpToLevel;
    player.level += 1;
    player.xpToLevel = Math.round(player.xpToLevel * 1.35);
    player.maxHealth += 12;
    player.health = player.maxHealth;
    player.maxStamina += 5;
    levelUps.push(player.level);
  }
  return levelUps;
}

export function spendCoins(player, amount) {
  amount = Math.max(0, Number(amount) || 0);
  if (player.coins < amount) return false;
  player.coins -= amount;
  return true;
}
