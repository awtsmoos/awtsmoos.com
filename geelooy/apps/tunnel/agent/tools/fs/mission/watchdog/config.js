// B"H
const DEFAULTS = { intervalMs: 15000, maxTicks: 8, staleMs: 120000 };
function policy(input = {}) { return { intervalMs: Number(input.intervalMs || DEFAULTS.intervalMs), maxTicks: Number(input.maxTicks || DEFAULTS.maxTicks), staleMs: Number(input.staleMs || DEFAULTS.staleMs) }; }
module.exports = { DEFAULTS, policy };
