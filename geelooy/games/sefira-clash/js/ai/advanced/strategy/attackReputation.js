/**
 * B"H
 * Attack reputation memory.
 *
 * Chapter 38: no opponent is merely nearby. Every shield, jump, charge, and air
 * habit leaves a faint footprint; the bot counters patterns without needing a
 * neural net or a heavy oracle.
 */
export function updateAttackReputation(bot, world) {
  bot.aiMind ||= {};
  const id = world.target.id;
  bot.aiMind.reputation ||= {};
  const rep = bot.aiMind.reputation[id] ||= fresh();
  decay(rep);
  if (world.target.blocking) rep.shield += 4;
  if (!world.target.grounded) rep.air += 2.2;
  if (world.target.vy < -4) rep.jump += 2;
  if (world.target.vy > 5) rep.fall += 2.4;
  if ((world.target.charge?.punch || 0) + (world.target.charge?.kick || 0) > 18) rep.charge += 5;
  if (world.target.stun > 0) rep.stunned += 3;
  rep.total = rep.shield + rep.air + rep.jump + rep.fall + rep.charge + rep.stunned;
  rep.counter = counterFor(rep);
  return rep;
}

function counterFor(rep) {
  if (rep.shield > 24) return 'grab';
  if (rep.fall > 22) return 'landingTrap';
  if (rep.air > 28 || rep.jump > 20) return 'antiAir';
  if (rep.charge > 22) return 'punishCharge';
  if (rep.stunned > 18) return 'comboExtend';
  return 'neutral';
}

function decay(rep) {
  for (const key of ['shield', 'air', 'jump', 'fall', 'charge', 'stunned']) rep[key] *= 0.965;
}

function fresh() {
  return { shield: 0, air: 0, jump: 0, fall: 0, charge: 0, stunned: 0, total: 0, counter: 'neutral' };
}
