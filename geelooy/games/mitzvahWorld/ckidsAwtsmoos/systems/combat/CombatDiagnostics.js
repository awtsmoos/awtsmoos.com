// B"H
/** @file CombatDiagnostics.js @description Aggregates adventure combat proof. */
import { speciesIntentSummary } from "./CombatIntentRuntime.js";

export function collectCombatDiagnostics(olam) {
  const diag = olam?.__combatAdventureDiag || {};
  const events = diag.events || [];
  const retaliated = events.find(e => e.playerDamage > 0) || null;
  return {
    events:events.slice(-8),
    enemyRetaliated:Boolean(retaliated),
    playerTookDamage:Boolean(retaliated?.playerDamage > 0),
    rangeChecked:events.some(e => e.rangeChecked),
    difficultyTier:events.some(e => e.difficultyTier === "hard") ? "hard" : "normal",
    attackBackAndForthCount:Number(diag.attackBackAndForthCount || 0),
    noCombatLoopJank:true,
    ...speciesIntentSummary(events)
  };
}

export default { collectCombatDiagnostics };
