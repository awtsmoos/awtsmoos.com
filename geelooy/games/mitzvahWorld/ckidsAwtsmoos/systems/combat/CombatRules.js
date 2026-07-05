// B"H
/** @file CombatRules.js @description Shared adventure-combat constants. */
export const SPECIES_COMBAT_RULES = Object.freeze({
  fox: { tier:"hard", retaliation:"pounce", damage:9, range:3.8, cooldownMs:900, canDodge:true },
  deer: { tier:"normal", retaliation:"flee_kick", damage:5, range:2.4, cooldownMs:1300, flees:true },
  goat: { tier:"hard", retaliation:"charge", damage:8, range:4.8, cooldownMs:1100 },
  cow: { tier:"normal", retaliation:"shove", damage:6, range:3.2, cooldownMs:1500 },
  rabbit: { tier:"easy", retaliation:"flee", damage:0, range:2.2, cooldownMs:900, flees:true },
  frog: { tier:"easy", retaliation:"jump_away", damage:0, range:2.2, cooldownMs:900, flees:true },
  bird: { tier:"normal", retaliation:"fly_peck", damage:3, range:3.5, cooldownMs:1000, flees:true }
});

export function speciesCombatRule(species = "rabbit") {
  return SPECIES_COMBAT_RULES[species] || SPECIES_COMBAT_RULES.rabbit;
}

export function combatTierRank(tier = "easy") {
  return ({ easy:1, normal:2, hard:3 }[tier] || 1);
}

export default { SPECIES_COMBAT_RULES, speciesCombatRule, combatTierRank };
