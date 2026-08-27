// B"H
const DEFAULT_LIMITS = Object.freeze({
  maxConcurrentAgents: 8,
  maxInflightPerTunnel: 12,
  maxInlineChars: 12000,
  commandStartTimeoutMs: 120000,
  commandWaitTimeoutMs: 25000,
  outputPageChars: 12000,
  pollIntervalMs: 1000,
  backoffBaseMs: 400,
  backoffMaxMs: 10000
});
function makeConcurrencyPolicy(input = {}) {
  return { ...DEFAULT_LIMITS, ...(input || {}) };
}
function planToolExecution(action, policy = DEFAULT_LIMITS) {
  const name = String(action || "");
  const commandLike = /^command|^node|test|lint|build|stress/i.test(name);
  return {
    action: name,
    asyncFirst: commandLike,
    inlineOutput: !commandLike,
    maxInlineChars: commandLike ? 0 : policy.maxInlineChars,
    waitTimeoutMs: commandLike ? policy.commandWaitTimeoutMs : policy.commandStartTimeoutMs,
    pollIntervalMs: policy.pollIntervalMs,
    outputPageChars: policy.outputPageChars
  };
}
function backoffDelay(attempt, policy = DEFAULT_LIMITS) {
  const raw = policy.backoffBaseMs * Math.pow(2, Math.max(0, attempt - 1));
  return Math.min(policy.backoffMaxMs, raw);
}
module.exports = { DEFAULT_LIMITS, makeConcurrencyPolicy, planToolExecution, backoffDelay };
