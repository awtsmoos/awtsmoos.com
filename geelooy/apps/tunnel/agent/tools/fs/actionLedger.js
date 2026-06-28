// B"H
const crypto = require('crypto');
const Store = require('./actionLedgerStore.js');
const Policy = require('./actionLedgerPolicy.js');
const { redact } = require('./actionLedgerRedact.js');
function id(prefix = 'act') { return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`; }
async function ensure() { return true; }
async function record(config, input, output, meta = {}) {
  if (Policy.SKIP.has(input.action)) return output;
  const actionId = output.actionId || id('act');
  const entry = { actionId, inputRef: `awdb://${actionId}:input`, outputRef: `awdb://${actionId}:output`, parentActionId: input.parentActionId || null, action: input.action, input: redact(input), ok: output?.ok !== false, createdAt: new Date().toISOString(), ...meta };
  Store.save(config, entry, redact(output));
  const cleanup = await Store.garbageCollect(config);
  return { ...output, actionId, inputRef: entry.inputRef, outputRef: entry.outputRef, replayable: true, retention: cleanup.summary };
}
async function list(config, limit = 50) { return await Store.list(config, limit); }
async function get(config, actionId) { return await Store.get(config, actionId); }
async function garbageCollect(config, overrides = {}) { return await Store.garbageCollect(config, overrides); }
function patch(input, patchObj = {}) { return { ...input, ...patchObj }; }
function replaceAt(input, key, find, replace) { const out = JSON.parse(JSON.stringify(input)); let box = out; const parts = String(key || '').split('.').filter(Boolean); while (parts.length > 1) box = box[parts.shift()] ??= {}; box[parts[0]] = String(box[parts[0]] ?? '').split(find).join(replace); return out; }
module.exports = { record, list, get, patch, replaceAt, id, garbageCollect, retention: Policy.retention, redact, ensure };
