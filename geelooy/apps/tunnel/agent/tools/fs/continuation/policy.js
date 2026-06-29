// B"H
const Lease = require('./lease.js');

const DEFAULTS = {
  maxSteps: 8,
  maxMs: 25000,
  maxErrors: 1,
  stopOnGate: false,
  minimumRunMs: Lease.ONE_HOUR_MS,
  minimumSteps: 8,
  forever: true
};
const ACTIONS = ['continueMustCallNext', 'missionContinueUntilGate', 'missionContinueOneHour'];

function number(value, fallback, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.floor(n))) : fallback;
}

/**
 * B"H
 * Forever does not mean one giant HTTP request. It means small resumable
 * chunks, each refusing finality and returning the next call.
 */
function normalize(input = {}, started = Date.now()) {
  const lease = Lease.normalize(input, started);
  return {
    maxSteps: number(input.maxSteps, DEFAULTS.maxSteps, 1, 64),
    maxMs: number(input.maxMs || input.windowMs, DEFAULTS.maxMs, 1000, 55000),
    maxErrors: number(input.maxErrors, DEFAULTS.maxErrors, 0, 100),
    stopOnGate: input.stopOnGate === true || input.stopOnGate === 'true',
    lease
  };
}

module.exports = { DEFAULTS, ACTIONS, normalize };
