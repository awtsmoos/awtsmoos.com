// B"H
const DEFAULTS = { maxSteps: 60, maxMs: 3600000, maxErrors: 1, stopOnGate: false };
const ACTIONS = ['continueMustCallNext', 'missionContinueUntilGate', 'missionContinueOneHour'];
function number(value, fallback, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const n = Number(value); return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.floor(n))) : fallback;
}
function normalize(input = {}) {
  return { maxSteps: number(input.maxSteps, DEFAULTS.maxSteps, 1, 5000), maxMs: number(input.maxMs || input.windowMs, DEFAULTS.maxMs, 1000, 24 * 3600000), maxErrors: number(input.maxErrors, DEFAULTS.maxErrors, 0, 100), stopOnGate: input.stopOnGate === true || input.stopOnGate === 'true' };
}
module.exports = { DEFAULTS, ACTIONS, normalize };
