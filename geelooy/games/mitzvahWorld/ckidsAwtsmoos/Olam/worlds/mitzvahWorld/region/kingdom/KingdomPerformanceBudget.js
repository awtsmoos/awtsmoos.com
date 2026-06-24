// B"H
/** @file KingdomPerformanceBudget.js @description Strict frame covenant: more world, bounded vessel. */
const DEFAULT_CAPS = Object.freeze({ frameMs:16.67, cpuMs:5.2, drawCalls:260, materials:48, activeNpcs:24, activeAnimals:96, activeChunks:18, visibleInstances:22000, hardColliders:140, eventsPerTick:20, raycasts:6 });
const STEPS = Object.freeze({ full:[], guarded:["time-slice-ai","reduce-far-animation"], reduced:["sleep-far-chunks","animal-mid-proxies","npc-4hz"], emergency:["statistical-far-world","pause-ornaments","hard-cap-raycasts","collapse-distant-actors"] });
function num(v){ return Number.isFinite(Number(v)) ? Number(v) : 0; }
function peakOf(pressure){ return Math.max(0, ...Object.values(pressure)); }
function modeOf(peak){ return peak > 1.25 ? "emergency" : peak > 1 ? "reduced" : peak > .72 ? "guarded" : "full"; }
export function createKingdomPerformanceBudget(overrides = {}) { return { version:"kingdom-budget-v3-60fps-covenant", caps:Object.freeze({ ...DEFAULT_CAPS, ...overrides }), mode:"full", pressure:{}, degrade:[] }; }
export function measureBudgetPressure(budget, demand = {}) { const pressure = {}; for (const key of Object.keys(budget.caps)) pressure[key] = budget.caps[key] > 0 ? num(demand[key]) / budget.caps[key] : 0; const mode = modeOf(peakOf(pressure)); return { ...budget, mode, pressure, degrade:STEPS[mode] || [] }; }
export function kingdomDemandFromReport(report = {}) { const s = report.summary || report.stats || {}, k = report.kingdom?.summary || {}; return { frameMs:num(s.frameMs || s.avgFrameMs), drawCalls:num(s.drawCalls), materials:num(s.materials), activeNpcs:num(s.npcSchedules || s.npcs), activeAnimals:num(s.wildlife || s.animals), visibleInstances:num(s.visibleInstances), hardColliders:num(s.hardColliders), activeChunks:num(k.activeChunks || 1), eventsPerTick:num(report.kingdom?.events?.recent?.length), raycasts:num(s.raycasts) }; }
export function budgetSummary(budget) { return { version:budget.version, mode:budget.mode, caps:budget.caps, degrade:budget.degrade, pressure:budget.pressure }; }
export default { createKingdomPerformanceBudget, measureBudgetPressure, kingdomDemandFromReport, budgetSummary };
