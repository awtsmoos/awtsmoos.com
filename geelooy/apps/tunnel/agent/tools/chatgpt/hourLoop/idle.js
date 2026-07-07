// B"H
const { readIdleState } = require('../runtime/idleDetector.js');
const C = require('./constants.js');

/** B"H — Chapter 1950: The tick only glances at the river. */
async function read(input = {}) {
  const port = Number(input.port || input.chromePort || 9223);
  const got = await readIdleState({ ...input, port, evalTimeoutMs: input.evalTimeoutMs || C.TICK_TIMEOUT_MS }).catch(error => ({ ok: false, error: error.message }));
  return compact(got, port);
}

function compact(got = {}, port = 9223) {
  return {
    ok: got.ok !== false,
    port,
    idle: got.idle === true,
    busy: got.busy === true,
    href: got.href || '',
    title: got.title || '',
    promptFound: got.promptFound === true,
    assistantTextPreview: short(got.text || '', 500),
    error: got.error || ''
  };
}
function short(text, max) { const s = String(text || ''); return s.length > max ? `${s.slice(0, max)}…` : s; }
module.exports = { read, compact, short };
