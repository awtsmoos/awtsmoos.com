// B"H
const TOOL_ACTIONS = new Set([
  'read','read64','readLines','readManyLines','bulk','bulkRead','readMany',
  'grep','rg','selectString','find','findFiles','list','tree','stat','connectedFiles',
  'gitDiffSmart','gitStatusDeep','command','commandRun','shellCommand','commandStart',
  'commandWait','commandStatus','commandPoll','commandJobStatus','commandJobWait',
  'commandJobOutputPage','commandOutputPage','write','writeIfHash','bulkWrite',
  'applyPatch','mkdirp','touch','moveFile','moveTree','copyFile','copyTree'
]);
function enabled(payload = {}) { return payload.disableMissionReceipts !== true && payload.disableMissionReceipts !== 'true'; }
module.exports = { TOOL_ACTIONS, enabled };
