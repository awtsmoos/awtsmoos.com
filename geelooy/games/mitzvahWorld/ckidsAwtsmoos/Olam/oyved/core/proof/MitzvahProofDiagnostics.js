// B"H
/** @file MitzvahProofDiagnostics.js @description Shared proof scoring helpers. */
const n = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export function summarizeAnimalIntents(rows = []) {
  const wanderedCount = rows.filter(a => /wander|climb|flock|hop|patrol|follow/i.test(String(a.state))).length;
  const fleeCount = rows.filter(a => /flee|panic|alarm|swoop/i.test(String(a.state))).length;
  const aggressiveCount = rows.filter(a => a.species === "fox" || /hunt|attack|pounce|strike|combat/i.test(String(a.state))).length;
  const retaliatedCount = rows.filter(a => /attack|hunt|combat|pounce|strike/i.test(String(a.state)) || a.creatureState?.state === "combat").length;
  const visualLod = rows.reduce((acc, a) => {
    const key = a.visualLodTier || "unmeasured";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return { wanderedCount, fleeCount, aggressiveCount, retaliatedCount, visualLod };
}

export function summarizeMovementProof({ qLeft, eRight, jumpRise, samples = [] }) {
  let jumpAirMs = 0;
  let snapDownDuringRise = false;
  for (let i = 1; i < samples.length; i++) {
    if (!samples[i].onFloor) jumpAirMs += 80;
    if (samples[i].y + 0.08 < samples[i - 1].y && samples[i - 1].vy > 0.05 && samples[i].vy > 0.05) snapDownDuringRise = true;
  }
  return {
    qLeftDistance:n(qLeft),
    eRightDistance:n(eRight),
    jumpRise:n(jumpRise),
    jumpAirMs,
    snapDownDuringRise
  };
}

export function summarizePerformanceProof(fps = null) {
  const stages = fps?.stages || {};
  const renderBudget = fps?.renderBudget || globalThis.__MITZVAH_RENDER_BUDGET_DIAG__?.() || null;
  const adaptiveResolution = fps?.adaptiveResolution || globalThis.__MITZVAH_RENDER_RESOLUTION_DIAG__?.() || null;
  return {
    fpsValue:n(fps?.fps, null),
    renderMs:n(stages.render ?? fps?.renderCostMs, null),
    totalMs:n(stages.total ?? fps?.avgWallFrameMs, null),
    renderBudget,
    adaptiveResolution
  };
}
