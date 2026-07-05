// B"H
/** @file CombatIntentRuntime.js @description Proof helpers for species combat intents. */
export function speciesIntentSummary(events = []) {
  return {
    foxPounceProof:events.some(e => e.species === "fox" && e.retaliation === "pounce"),
    deerFleeProof:events.some(e => e.species === "deer" && /flee/.test(e.state || e.retaliation)),
    goatChargeProof:events.some(e => e.species === "goat" && e.retaliation === "charge")
  };
}

export default { speciesIntentSummary };
