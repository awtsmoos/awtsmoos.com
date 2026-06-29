// B"H
const Mission = require('../mission/index.js');
function mid(p) { return p.missionId || p.id || p.target || ''; }
function receiptPayload(payload = {}) { return { nodeId:payload.nodeId || payload.workNodeId || '', kind:'preview', summary:payload.summary || `Live preview ${payload.url || payload.previewUrl || ''}`, proof:{ url:payload.url || payload.previewUrl || '', expiresAt:payload.expiresAt || '', scope:payload.scope || {}, verified:payload.verified === true || payload.verified === 'true' } }; }
async function withMission(config, payload, fn) { const m = await Mission.load(config, mid(payload)); if (!m) return { ok:false, action:payload.action, error:'mission_not_found' }; const out = await fn(m); await Mission.save(config, m); return out; }
function buildPreviewReceiptActions(ctx) { const { config, payload = {} } = ctx; return {
  async previewReceiptAttach() { return withMission(config, payload, m => ({ ok:true, action:'previewReceiptAttach', receipt:Mission.missionOsReceipt(m, receiptPayload(payload)), missionOs:Mission.missionOsStatus(m) })); },
  async previewReceiptList() { return withMission(config, payload, m => ({ ok:true, action:'previewReceiptList', receipts:(Mission.missionOsStatus(m).execution.receipts || []).filter(r => r.kind === 'preview') })); },
  async previewReceiptVerify() { return withMission(config, payload, m => ({ ok:true, action:'previewReceiptVerify', receipt:Mission.missionOsReceipt(m, { ...receiptPayload(payload), kind:'verification', summary:payload.summary || 'Preview verified remotely' }), missionOs:Mission.missionOsStatus(m) })); }
};}
/**
 * B"H
 * A preview without a receipt is a dream after waking. This bridge ties every
 * live URL to the Mission OS ledger so release court can see what was viewed.
 */
module.exports = { buildPreviewReceiptActions };
