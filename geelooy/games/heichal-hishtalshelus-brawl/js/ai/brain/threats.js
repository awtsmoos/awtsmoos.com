/**
 * B"H
 * Threat target selection.
 *
 * Chapter 43: the bot stops worshipping mere nearness. It remembers who hurt
 * it, respects weapons and buffs, and sometimes turns toward a rival because
 * the story of the match has named an enemy.
 */
export function chooseTarget(bot, fighters) {
  let best = null;
  let bestScore = -Infinity;
  for (let i = 0; i < fighters.length; i++) {
    const f = fighters[i];
    if (f === bot || f.dead) continue;
    const score = threatScore(bot, f);
    if (score > bestScore) { best = f; bestScore = score; }
  }
  return best;
}

export function threatScore(bot, f) {
  const dx = Math.abs(f.x - bot.x);
  const dy = Math.abs(f.y - bot.y);
  const near = Math.max(0, 700 - dx - dy * 0.5);
  const armed = f.heldWeapon ? 180 : 0;
  const buffed = f.buffs && Object.keys(f.buffs).length ? 140 : 0;
  const attacking = f.attack ? 120 : 0;
  const woundedKillable = f.damage * 0.8;
  const rival = bot.ai?.lastAttacker === f.id ? 260 : 0;
  return near + armed + buffed + attacking + woundedKillable + rival;
}
