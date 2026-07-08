// B"H
const COMMON = ['BH','ok','action','status','error','summary','next','responseShape','previewRequired','responseFocus','previewPolicy'];
const TRANSPORT = ['type','id','tunnelName','requestedTunnelName','controlRequestId','clientRequestId','agentSessionId','logicalAgentId','projectRoot','nonce','requestAction','actualAction','actionMismatch','vessel','routeReason'];
const CONTRACTS = Object.freeze({
  read: ['content','returnedChars','totalChars','hasNextPage','nextOffsetChars','nextPagePayload','absolutePath','path'],
  readLines: ['content','lines','returnedLines','totalLines','hasNextPage','nextPagePayload','absolutePath','path'],
  readManyLines: ['results','files','count','errors'],
  list: ['items','entries','files','dirs','count','root','absolutePath'],
  tree: ['items','entries','files','dirs','count','root','absolutePath'],
  stat: ['exists','isFile','isDirectory','size','mtimeMs','absolutePath','path'],
  write: ['absolutePath','path','bytes','written','hash','sha256'],
  bulkWrite: ['taskId','status','running','done','results','count','statusPayload','waitPayload'],
  commandStart: ['jobId','status','running','done','statusPayload','waitPayload','stdoutPagePayload','stderrPagePayload','outputPage'],
  commandRun: ['jobId','status','running','done','statusPayload','waitPayload','stdoutPagePayload','stderrPagePayload','outputPage','stdout','stderr','exitCode'],
  commandWait: ['jobId','status','running','done','exitCode','signal','timedOut','statusPayload','stdoutPagePayload','stderrPagePayload','outputPage'],
  commandJobOutputPage: ['jobId','stream','content','returnedChars','totalChars','hasNextPage','nextOffsetChars','nextPagePayload'],
  taskReceipt: ['taskId','state','status','running','done','progress','result','error','resume','outputPage','evidence'],
  taskStatus: ['taskId','state','status','running','done','progress','result','error','resume','outputPage','evidence'],
  taskOutputPage: ['taskId','stream','content','returnedChars','totalChars','hasNextPage','nextOffsetChars'],
  missionStart: ['missionId','status','running','done','resume','nextAction','plan','queue','evidence'],
  missionStatus: ['missionId','status','running','done','resume','nextAction','plan','queue','evidence']
});
function keysFor(action = '') { return [...new Set([...TRANSPORT, ...COMMON, ...(CONTRACTS[action] || [])])]; }
function pick(action, result = {}) { const keys = keysFor(action || result.action || result.actualAction || result.requestAction); const out = {}; for (const k of keys) if (result[k] !== undefined) out[k] = result[k]; return out; }
function has(action, key) { return keysFor(action).includes(key); }
module.exports = { COMMON, TRANSPORT, CONTRACTS, keysFor, pick, has };
