// B"H
/**
 * @file KingdomPerformanceBudget.js
 * @description The kingdom is vast in vision, capped in vessel; beauty kneels to proof.
 */
const DEFAULT_CAPS = Object.freeze({
  cpuMs: 5.5,
  drawCalls: 180,
  activeNpcs: 20,
  activeAnimals: 80,
  activeChunks: 24,
  visibleInstances: 12000,
  hardColliders: 96,
  eventsPerTick: 24
});

export function createKingdomPerformanceBudget(overrides = {}) {
  const caps = Object.freeze({ ...DEFAULT_CAPS, ...overrides });
  return { version: "kingdom-budget-v1", caps, mode: "full", pressure: {}, degrade: [] };
}

export function measureBudgetPressure(budget, demand = {}) {
  const pressure = {};
  for (const [key, cap] of Object.entries(budget.caps)) {
    const value = Number(demand[key] || 0);
    pressure[key] = cap > 0 ? value / cap : 0;
  }
  const peak = Math.max(0, ...Object.values(pressure));
  const mode = peak > 1.35 ? "emergency" : peak > 1 ? "reduced" : peak > .72 ? "guarded" : "full";
  return { ...budget, mode, pressure, degrade: degradeFor(mode) };
}

export function kingdomDemandFromReport(report = {}) {
  const s = report.summary || {};
  return {
    activeNpcs: Math.min(s.npcSchedules || 0, 20),
    activeAnimals: Math.min(s.wildlife || 0, 80),
    visibleInstances: s.visibleInstances || 0,
    hardColliders: s.hardColliders || 0,
    activeChunks: report.kingdom?.summary?.activeChunks || 1,
    drawCalls: 20 + Math.ceil((s.visibleInstances || 0) / 800),
    eventsPerTick: report.kingdom?.events?.recent?.length || 0
  };
}

export function budgetSummary(budget) {
  return { version: budget.version, mode: budget.mode, caps: budget.caps, degrade: budget.degrade };
}

function degradeFor(mode) {
  if (mode === "emergency") return ["sleep-far-chunks", "collapse-npc-crowds", "animal-impostors", "ornament-off"];
  if (mode === "reduced") return ["time-slice-ai", "reduce-far-animation", "chunk-summary-wildlife"];
  if (mode === "guarded") return ["prefer-instancing", "defer-ornament"];
  return [];
}
