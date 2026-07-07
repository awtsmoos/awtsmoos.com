// B"H
const ledger = require('../actionLedger.js');
const presets = require('./commandPresetActions.js');

const BIG_KEYS = new Set(['content', 'text', 'command', 'scriptText', 'paths', 'params', 'params64', 'query']);
const FULL_MODES = new Set(['full', 'debug', 'audit', 'raw']);
const MAX_TEXT = 240;

function aid(p) { return p.actionId || p.id || p.ref || p.parentActionId; }
function patchObj(p) { return p.patch || (p.params ? JSON.parse(p.params) : {}); }
function wantedFilters(payload = {}) { return ['missionId', 'conversationId', 'conversationName', 'agentSessionId', 'logicalAgentId', 'clientRequestId', 'tunnelName'].filter(k => payload[k]); }
function same(entry, key, value) { const input = entry.input || {}; return String(entry[key] || input[key] || '') === String(value || ''); }
function filterHistory(history, payload = {}) { const keys = wantedFilters(payload); return keys.length ? history.filter(entry => keys.every(k => same(entry, k, payload[k]))) : history; }
function wantsFull(payload = {}) { return FULL_MODES.has(String(payload.responseMode || payload.mode || '').toLowerCase()) || payload.full === true || payload.compact === false; }

/**
 * B"H
 * Chapter 1930: The archive learned to whisper.
 *
 * A liveness tool must not become the flood it measures. Lists and searches now
 * carry tiny fossils by default; full scrolls remain available through get/full.
 */
function compactHistory(entry = {}) {
  const input = compactValue(entry.input || {}, 0);
  return clean({
    actionId: entry.actionId,
    parentActionId: entry.parentActionId,
    action: entry.action,
    ok: entry.ok,
    createdAt: entry.createdAt,
    inputRef: entry.inputRef,
    outputRef: entry.outputRef,
    historyBackend: entry.historyBackend,
    deviceState: entry.deviceState,
    input
  });
}
function compactRecord(record = {}) { return record && { ...record, entry: compactHistory(record.entry || {}) }; }
function compactValue(value, depth) {
  if (value == null) return value;
  if (typeof value === 'string') return shorten(value);
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.slice(0, 12).map(v => compactValue(v, depth + 1));
  if (depth > 2) return '[object elided]';
  const out = {};
  for (const [key, val] of Object.entries(value)) out[key] = BIG_KEYS.has(key) ? summarize(key, val) : compactValue(val, depth + 1);
  return clean(out);
}
function summarize(key, value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? '');
  return { elided: true, key, chars: text.length, preview: shorten(text) };
}
function shorten(text) { const s = String(text || ''); return s.length > MAX_TEXT ? `${s.slice(0, MAX_TEXT)}…` : s; }
function clean(obj) { for (const k of Object.keys(obj)) if (obj[k] === undefined) delete obj[k]; return obj; }
function visibleHistory(raw, payload) { return wantsFull(payload) ? raw : raw.map(compactHistory); }
function visibleRecord(record, payload) { return wantsFull(payload) ? record : compactRecord(record); }

function buildActionHistoryActions(ctx, buildActions) {
  const { config, payload, ws } = ctx;
  const run = async next => { const a = buildActions(config, next, ws); if (!a[next.action]) throw new Error('Unknown replay action: ' + next.action); return a[next.action](); };
  async function getInput(id) { const got = await ledger.get(config, id); return got && got.entry.input; }
  async function replay(id, next) { return run({ ...(next || await getInput(id)), parentActionId: id }); }
  const api = {
    async actionHistoryList() { const raw = filterHistory(await ledger.list(config, Number(payload.limit || 50)), payload); return { ok:true, action:payload.action, compact:!wantsFull(payload), filters:Object.fromEntries(wantedFilters(payload).map(k => [k, payload[k]])), history:visibleHistory(raw, payload) }; },
    async actionHistoryGet() { const record = await ledger.get(config, aid(payload)); return { ok:!!record, action:payload.action, compact:!wantsFull(payload), record:visibleRecord(record, payload) }; },
    async actionHistorySearch() { const q = String(payload.query || payload.text || '').toLowerCase(); const raw = filterHistory(await ledger.list(config, Number(payload.limit || 500)), payload); const history = raw.filter(x => JSON.stringify(x).toLowerCase().includes(q)); return { ok:true, action:payload.action, compact:!wantsFull(payload), query:q, history:visibleHistory(history, payload) }; },
    async actionHistoryReplay() { const id = aid(payload); const input = await getInput(id); return input ? { ok:true, action:payload.action, replayOf:id, result:await replay(id, input) } : { ok:false, error:'unknown_actionId' }; },
    async actionHistoryPatch() { const id = aid(payload); const input = await getInput(id); if (!input) return { ok:false, error:'unknown_actionId' }; const next = ledger.patch(input, patchObj(payload)); return payload.dryRun ? { ok:true, payload:wantsFull(payload) ? next : compactValue(next, 0) } : { ok:true, result:await replay(id, next) }; },
    async actionHistoryReplace() { const id = aid(payload); const input = await getInput(id); if (!input) return { ok:false, error:'unknown_actionId' }; const next = ledger.replaceAt(input, payload.path || payload.target, payload.find, payload.replace); return payload.dryRun ? { ok:true, payload:wantsFull(payload) ? next : compactValue(next, 0) } : { ok:true, result:await replay(id, next) }; },
    async actionHistoryDiff() { const a = await ledger.get(config, payload.actionId || payload.f1); const b = await ledger.get(config, payload.otherActionId || payload.f2); return { ok:!!(a && b), action:payload.action, left:visibleRecord(a, payload)?.entry?.input, right:visibleRecord(b, payload)?.entry?.input }; },
    async actionHistoryExplain() { const got = await ledger.get(config, aid(payload)); return { ok:!!got, action:payload.action, explanation:got && { actionId:got.entry.actionId, action:got.entry.action, ok:got.entry.ok, input:compactValue(got.entry.input, 0), outputKeys:Object.keys(got.output || {}) } }; },
    async lastActionReplay() { const h = await ledger.list(config, 1); return h[0] ? { ok:true, replayOf:h[0].actionId, result:await replay(h[0].actionId, h[0].input) } : { ok:false, error:'empty_history' }; },
    async actionHistoryPin() { return this.actionHistoryGet(); }, async actionHistoryUnpin() { return { ok:true, action:payload.action, noop:true }; }, async actionHistoryGarbageCollect() { return await ledger.garbageCollect(config, { maxEntries:Number(payload.maxEntries || undefined), maxAgeMs:Number(payload.maxAgeMs || undefined), maxResultFiles:Number(payload.maxResultFiles || undefined) }); },
    async templateFromAction() { const input = await getInput(aid(payload)); if (!input) return { ok:false, error:'unknown_actionId' }; const p = { ...payload, action:'commandPresetSave', presetAction:input.action, template:input, name:payload.name || input.action }; const a = presets.buildCommandPresetActions({ config, payload:p, ws }, buildActions); return a.commandPresetSave(); },
    async templateFromHistory() { return this.templateFromAction(); }, async templatePatchRun() { return this.actionHistoryPatch(); }, async templateFork() { return this.templateFromAction(); }, async templatePromote() { return this.templateFromAction(); },
    async macroRecordStart() { return { ok:true, action:payload.action, recording:true }; }, async macroRecordStop() { return { ok:true, action:payload.action, recording:false }; }, async macroReplay() { return this.actionHistoryReplay(); }, async macroPatch() { return this.actionHistoryPatch(); }, async macroExplain() { return this.actionHistoryExplain(); }
  };
  for (const [k, v] of Object.entries({ commandMemoryList:'actionHistoryList', commandMemoryGet:'actionHistoryGet', commandMemoryRun:'actionHistoryReplay', commandMemoryPatch:'actionHistoryPatch', commandMemoryFork:'templateFromAction', commandMemoryDelete:'actionHistoryGarbageCollect', commandMemorySave:'templateFromAction' })) api[k] = api[v];
  return api;
}
module.exports = { buildActionHistoryActions, filterHistory, compactHistory, compactValue, wantsFull };
