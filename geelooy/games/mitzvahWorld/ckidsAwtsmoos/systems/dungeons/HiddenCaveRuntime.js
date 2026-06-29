// B"H
/**
 * HiddenCaveRuntime
 *
 * Dormant content contract, intentionally outside the current phone-critical
 * path. The cave is not deleted and not claimed as implemented gameplay. It is
 * a sealed story vessel: if a future owner opens it, the stages are explicit;
 * until then the Awtsmoos holds the doorway quiet and honest.
 */
export const HIDDEN_CAVE_OWNER = Object.freeze({
  owner: 'dormant-content-contract',
  runtimeOwner: 'intentionally-disabled-no-current-entry-trigger',
  verifiedBy: ['tests/headless/ownerContractAudit.mjs'],
  phoneCritical: false
});

export const HIDDEN_CAVE_STAGES = Object.freeze(['enter', 'learn_pattern', 'calm_spark', 'return']);

export function createHiddenCaveRuntime() {
  let stage = 0;
  return {
    owner:HIDDEN_CAVE_OWNER,
    next() { stage = Math.min(stage + 1, HIDDEN_CAVE_STAGES.length - 1); return HIDDEN_CAVE_STAGES[stage]; },
    current() { return HIDDEN_CAVE_STAGES[stage]; },
    reset() { stage = 0; return HIDDEN_CAVE_STAGES[stage]; }
  };
}

export default createHiddenCaveRuntime;
