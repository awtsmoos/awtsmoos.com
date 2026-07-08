// B"H
/** @file CombatDifficultyScaler.js @description Keeps wildlife fights from ending instantly. */
import { speciesCombatRule } from "./CombatRules.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export function applyAdventureDifficulty(target) {
  const mesh = target?.mesh || target;
  const data = mesh?.userData || {};
  const species = data.motion?.species || data.species || target?.def?.species || "rabbit";
  const rule = speciesCombatRule(species);
  const health = target?.health || data.health;
  if (health && !health.__adventureScaled) {
    const floor = rule.tier === "hard" ? 70 : rule.tier === "normal" ? 46 : 26;
    health.max = Math.max(Number(health.max || 1), floor);
    health.current = Math.max(Number(health.current || 1), Math.min(health.max, Math.ceil(floor * 0.72)));
    health.minHitsToKill = Math.max(Number(health.minHitsToKill || 1), rule.tier === "hard" ? 3 : 2);
    health.__adventureScaled = true;
  }
  data.combatDifficultyTier = rule.tier;
  return rule.tier;
}

export default { applyAdventureDifficulty };
