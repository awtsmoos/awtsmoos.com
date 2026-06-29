// B"H
const Mission = require('../index.js');
const Classify = require('./classify.js');
const Sum = require('./summary.js');
function missionId(payload = {}, config = {}) { return payload.missionId || payload.activeMissionId || payload.mission || config.mission?.activeMissionId || ''; }
function autoEnabled(payload = {}, config = {}) { if (payload.missionAutoAttach === false || payload.missionAutoAttach === 'false') return false; return config.mission?.autoAttachReceipts !== false; }
function nodeId(payload = {}, m) { return payload.nodeId || payload.workNodeId || m?.operatingSystem?.execution?.activeNode || ''; }
async function attach(config, payload = {}, action, result = {}) {
  const id = missionId(payload, config); if (!id || !autoEnabled(payload, config) || Classify.ignored(action)) return null;
  const m = await Mission.load(config, id); if (!m) return { ok:false, error:'mission_not_found_for_auto_receipt', missionId:id };
  Mission.missionOsSeed(m, { keepGoing:true });
  const nId = ensureNode(m, payload, action);
  const receipt = Mission.missionOsReceipt(m, { nodeId:nId, kind:Classify.kind(action), ok:result.ok !== false, summary:Sum.summary(action, payload, result), proof:Sum.safeProof(result), complete:payload.missionAutoComplete !== false });
  const prompt = Mission.missionOsPrompt(m, { steer:true });
  await Mission.save(config, m);
  return { receipt, prompt, missionOs:Mission.missionOsStatus(m), missionId:id };
}
function ensureNode(m, payload, action) {
  const active = nodeId(payload, m); if (active) return active;
  const type = Classify.type(action) || 'verification';
  const node = Mission.missionOsAddNode(m, { type, title:`Auto receipt for ${action}`, purpose:'Automatically created because a mission-aware action changed or inspected reality.', status:'executing', files:[payload.path || payload.p].filter(Boolean), commands:[payload.command].filter(Boolean), verificationMethod:'automatic action receipt' });
  m.operatingSystem.execution.activeNode = node.id;
  return node.id;
}
module.exports = { attach, missionId, autoEnabled };
