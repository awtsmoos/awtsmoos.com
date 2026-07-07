// B"H
const { sendPrompt } = require('../runtime/sendPrompt.js');
const C = require('./constants.js');
const H = require('./handoff.js');

/** B"H — Chapter 1951: Send one spark, then return. */
async function one(input = {}) {
  const message = H.short(input.message || input.prompt || '', C.PROMPT_MAX_CHARS);
  if (!message) return { ok: false, submitted: false, error: 'missing_prompt' };
  const got = await sendPrompt({ ...input, message, timeoutMs: input.timeoutMs || C.TICK_TIMEOUT_MS }).catch(error => ({ ok: false, error: error.message }));
  const result = got.result || got;
  return { ok: got.ok !== false, submitted: !!result.ok, via: result.via || '', href: result.href || '', promptChars: message.length, error: got.error || result.error || '' };
}
module.exports = { one };
