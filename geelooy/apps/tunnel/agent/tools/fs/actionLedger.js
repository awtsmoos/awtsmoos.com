// B"H
const crypto = require('crypto');
const Store = require('./actionLedgerStore.js');
const Policy = require('./actionLedgerPolicy.js');
const { redact } = require('./actionLedgerRedact.js');
const RETRIES = 4;
const BASE_DELAY_MS = 8;
const LEDGER_DEADLINE_MS = 250;
function id(prefix = 'act') { return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`; }
async function ensure() { return true; }
/** B"H — Ledger is evidence, never a foreground hostage. */
async function record(config, input, output, meta = {}) {
  if (Policy.shouldSkip?.(input.action) || Policy.SKIP.has(input.action)) return output;
  const actionId = output.actionId || id('act');
  const entry = { actionId, inputRef:`awdb://${actionId}:input`, outputRef:`awdb://${actionId}:output`, parentActionId:input.parentActionId || null, action:input.action, input:redact(input), ok:output?.ok !== false, createdAt:new Date().toISOString(), ...meta };
  const saved = await deadline(retryLedger(() => Store.savePending(config, entry, redact(output))), LEDGER_DEADLINE_MS, 'ledger_deadline');
  if (!saved.ok) return { ...output, actionId, replayable:false, ledgerWarning:saved.warning };
  return { ...output, actionId, inputRef:entry.inputRef, outputRef:entry.outputRef, replayable:true };
}
async function retryLedger(fn) {
  let last = null;
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    try { return { ok:true, value:await fn() }; }
    catch (error) {
      last = error;
      if (!isBusy(error) || attempt === RETRIES) break;
      await sleep(BASE_DELAY_MS * (attempt + 1) + Math.floor(Math.random() * BASE_DELAY_MS));
    }
  }
  return { ok:false, warning:{ ok:false, skipped:true, reason:'ledger_busy_or_failed', error:last?.message || String(last || 'unknown') } };
}
function deadline(promise, ms, label) {
  let timer;
  const timeout = new Promise(resolve => { timer = setTimeout(() => resolve({ ok:false, warning:{ ok:false, skipped:true, reason:label } }), ms); timer.unref?.(); });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
function isBusy(error) { return /exclusive writer|lock|busy|ledger_lock/i.test(String(error?.message || error || '')); }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
async function list(config, limit = 50) { return await Store.list(config, limit); }
async function get(config, actionId) { return await Store.get(config, actionId); }
async function garbageCollect(config, overrides = {}) { return await Store.garbageCollect(config, overrides); }
function patch(input, patchObj = {}) { return { ...input, ...patchObj }; }
function replaceAt(input, key, find, replace) { const out = JSON.parse(JSON.stringify(input)); let box = out; const parts = String(key || '').split('.').filter(Boolean); while (parts.length > 1) box = box[parts.shift()] ??= {}; box[parts[0]] = String(box[parts[0]] ?? '').split(find).join(replace); return out; }
module.exports = { record, list, get, patch, replaceAt, id, garbageCollect, retention:Policy.retention, redact, ensure, retryLedger, isBusy, deadline };
