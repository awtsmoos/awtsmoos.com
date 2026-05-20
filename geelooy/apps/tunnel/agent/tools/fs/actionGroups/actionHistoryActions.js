// B"H
const ledger = require("../actionLedger.js");
const presets = require("./commandPresetActions.js");

function aid(p) { return p.actionId || p.id || p.ref || p.parentActionId; }
function patchObj(p) { return p.patch || (p.params ? JSON.parse(p.params) : {}); }
function buildActionHistoryActions(ctx, buildActions) {
  const { config, payload, ws } = ctx;
  const run = async next => { const a = buildActions(config, next, ws); if (!a[next.action]) throw new Error("Unknown replay action: " + next.action); return a[next.action](); };
  async function getInput(id) { const got = await ledger.get(config, id); return got && got.entry.input; }
  async function replay(id, next) { return run({ ...(next || await getInput(id)), parentActionId: id }); }
  const api = {
    async actionHistoryList() { return { ok: true, action: payload.action, history: await ledger.list(config, Number(payload.limit || 50)) }; },
    async actionHistoryGet() { const record = await ledger.get(config, aid(payload)); return { ok: !!record, action: payload.action, record }; },
    async actionHistorySearch() { const q = String(payload.query || payload.text || "").toLowerCase(); const history = (await ledger.list(config, Number(payload.limit || 500))).filter(x => JSON.stringify(x).toLowerCase().includes(q)); return { ok: true, action: payload.action, query: q, history }; },
    async actionHistoryReplay() { const id = aid(payload); const input = await getInput(id); return input ? { ok: true, action: payload.action, replayOf: id, result: await replay(id, input) } : { ok: false, error: "unknown_actionId" }; },
    async actionHistoryPatch() { const id = aid(payload); const input = await getInput(id); if (!input) return { ok: false, error: "unknown_actionId" }; const next = ledger.patch(input, patchObj(payload)); return payload.dryRun ? { ok: true, payload: next } : { ok: true, result: await replay(id, next) }; },
    async actionHistoryReplace() { const id = aid(payload); const input = await getInput(id); if (!input) return { ok: false, error: "unknown_actionId" }; const next = ledger.replaceAt(input, payload.path || payload.target, payload.find, payload.replace); return payload.dryRun ? { ok: true, payload: next } : { ok: true, result: await replay(id, next) }; },
    async actionHistoryDiff() { const a = await ledger.get(config, payload.actionId || payload.f1); const b = await ledger.get(config, payload.otherActionId || payload.f2); return { ok: !!(a && b), action: payload.action, left: a?.entry?.input, right: b?.entry?.input }; },
    async actionHistoryExplain() { const got = await ledger.get(config, aid(payload)); return { ok: !!got, action: payload.action, explanation: got && { actionId: got.entry.actionId, action: got.entry.action, ok: got.entry.ok, input: got.entry.input, outputKeys: Object.keys(got.output || {}) } }; },
    async lastActionReplay() { const h = await ledger.list(config, 1); return h[0] ? { ok: true, replayOf: h[0].actionId, result: await replay(h[0].actionId, h[0].input) } : { ok: false, error: "empty_history" }; },
    async actionHistoryPin() { return this.actionHistoryGet(); }, async actionHistoryUnpin() { return { ok: true, action: payload.action, noop: true }; }, async actionHistoryGarbageCollect() { return { ok: true, action: payload.action, noop: true }; },
    async templateFromAction() { const input = await getInput(aid(payload)); if (!input) return { ok: false, error: "unknown_actionId" }; const p = { ...payload, action: "commandPresetSave", presetAction: input.action, template: input, name: payload.name || input.action }; const a = presets.buildCommandPresetActions({ config, payload: p, ws }, buildActions); return a.commandPresetSave(); },
    async templateFromHistory() { return this.templateFromAction(); }, async templatePatchRun() { return this.actionHistoryPatch(); }, async templateFork() { return this.templateFromAction(); }, async templatePromote() { return this.templateFromAction(); },
    async macroRecordStart() { return { ok: true, action: payload.action, recording: true }; }, async macroRecordStop() { return { ok: true, action: payload.action, recording: false }; }, async macroReplay() { return this.actionHistoryReplay(); }, async macroPatch() { return this.actionHistoryPatch(); }, async macroExplain() { return this.actionHistoryExplain(); }
  };
  for (const [k, v] of Object.entries({ commandMemoryList:"actionHistoryList", commandMemoryGet:"actionHistoryGet", commandMemoryRun:"actionHistoryReplay", commandMemoryPatch:"actionHistoryPatch", commandMemoryFork:"templateFromAction", commandMemoryDelete:"actionHistoryGarbageCollect", commandMemorySave:"templateFromAction" })) api[k] = api[v];
  return api;
}
module.exports = { buildActionHistoryActions };
