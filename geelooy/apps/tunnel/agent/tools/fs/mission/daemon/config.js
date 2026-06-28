// B"H
const DEFAULTS = { maxSteps: 8, maxMs: 30000, autoAnswer: false };
function policy(input = {}) { return { maxSteps: Number(input.maxSteps || DEFAULTS.maxSteps), maxMs: Number(input.maxMs || DEFAULTS.maxMs), autoAnswer: input.autoAnswer === true || input.autoAnswer === 'true' }; }
module.exports = { DEFAULTS, policy };
