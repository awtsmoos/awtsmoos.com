// B"H
const DEFAULT_PROMPT = "continue with the next verified steps";
const DEFAULT_MAX_TURNS = 40;
const MAX_TURNS_LIMIT = 400;
const DEFAULT_SETTLE_MS = 2500;
const DEFAULT_TIMEOUT_MS = 180000;

/**
 * B"H
 * The loop is a ladder, never a trap. Forty rungs are offered by default, but
 * every rung is visible, stoppable, and written into durable state before the
 * next one is climbed.
 */
function boundedTurns(value, fallback = DEFAULT_MAX_TURNS) {
  const n = Number(value || fallback);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(Math.floor(n), MAX_TURNS_LIMIT));
}

function continuePrompt(payload = {}) {
  return String(payload.continuePrompt || payload.prompt || payload.message || DEFAULT_PROMPT).trim() || DEFAULT_PROMPT;
}

module.exports = { DEFAULT_PROMPT, DEFAULT_MAX_TURNS, MAX_TURNS_LIMIT, DEFAULT_SETTLE_MS, DEFAULT_TIMEOUT_MS, boundedTurns, continuePrompt };
