// B"H
const Lease = require('../../continuation/lease.js');

const DEFAULTS = {
  maxSteps: 8,
  maxMs: 25000,
  autoAnswer: false,
  minimumRunMs: Lease.ONE_HOUR_MS,
  forever: true
};

function number(value, fallback, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.floor(n))) : fallback;
}

function policy(input = {}) {
  const lease = Lease.normalize(input);
  return {
    maxSteps: number(input.maxSteps, DEFAULTS.maxSteps, 1, 64),
    maxMs: number(input.maxMs || input.windowMs, DEFAULTS.maxMs, 1000, 55000),
    autoAnswer: input.autoAnswer === true || input.autoAnswer === 'true',
    lease
  };
}

module.exports = { DEFAULTS, policy };
