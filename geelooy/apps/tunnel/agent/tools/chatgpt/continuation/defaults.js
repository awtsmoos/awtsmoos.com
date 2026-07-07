// B"H
const DEFAULT_PROMPT = "continue with the next verified steps";
const DEFAULT_MAX_TURNS = 40;
const MAX_TURNS_LIMIT = 400;
const DEFAULT_SETTLE_MS = 900;
const DEFAULT_TIMEOUT_MS = 1200;
const MAX_TICK_TIMEOUT_MS = 1500;

/**
 * B"H
 * Chapter 1935: Every ChatGPT continuation became a short tick.
 * The browser may think for minutes, but the tunnel must not.
 */
function boundedTurns(value, fallback = DEFAULT_MAX_TURNS) {
  const n = Number(value || fallback);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(Math.floor(n), MAX_TURNS_LIMIT));
}
function continuePrompt(payload = {}) {
  return String(payload.continuePrompt || payload.prompt || payload.message || DEFAULT_PROMPT).trim() || DEFAULT_PROMPT;
}
function shortTimeout(value, fallback = DEFAULT_TIMEOUT_MS) {
  const n = Number(value || fallback);
  return Math.max(250, Math.min(Number.isFinite(n) ? Math.floor(n) : fallback, MAX_TICK_TIMEOUT_MS));
}
function settleMs(value, fallback = DEFAULT_SETTLE_MS) {
  const n = Number(value || fallback);
  return Math.max(100, Math.min(Number.isFinite(n) ? Math.floor(n) : fallback, 1500));
}
module.exports = { DEFAULT_PROMPT, DEFAULT_MAX_TURNS, MAX_TURNS_LIMIT, DEFAULT_SETTLE_MS, DEFAULT_TIMEOUT_MS, MAX_TICK_TIMEOUT_MS, boundedTurns, continuePrompt, shortTimeout, settleMs };
