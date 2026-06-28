// B"H
const TOOL_ACTIONS = new Set(['read','read64','grep','findFiles','commandRun','commandWait','write','writeIfHash','bulkWrite','applyPatch','list','tree']);
function enabled(payload = {}) { return payload.disableMissionReceipts !== true && payload.disableMissionReceipts !== 'true'; }
module.exports = { TOOL_ACTIONS, enabled };
