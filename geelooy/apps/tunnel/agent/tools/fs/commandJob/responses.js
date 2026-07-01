// B"H
const Paths = require('./paths.js');
const P = require('./policy.js');
const ResponseV8 = require('../../../lib/runtime/response-v8.js');
const WorkerProtocol = require('../../../lib/workers/worker-protocol.js');
function start(jobId, details) {
  const meta = details.meta || details;
  const worker = meta.worker || details.worker || {};
  const receipt = meta.receipt || details.receipt || {};
  return ResponseV8.compactTrust({
    ok:true,
    action:'commandStart',
    requestAction:meta.requestAction || 'commandStart',
    actualAction:meta.actualAction || 'commandStart',
    jobId,
    workerId:worker.workerId,
    status:'running',
    summary:'Started command in isolated subprocess worker.',
    next:`Poll commandJobStatus with jobId ${jobId}.`,
    trust:'The command runs outside the tunnel event loop; output is paged, a receipt was saved, and the worker can be cancelled.',
    command:details.command,
    cwd:details.cwd,
    shell:details.shell,
    timeoutMs:details.timeoutMs,
    storage:details.storage,
    worker,
    receipt,
    cost:meta.cost,
    evidence:WorkerProtocol.evidenceFor(worker, receipt),
    ...payloads(jobId),
    aiInstructions:instruction(details.storage)
  });
}
function status(jobId, meta, payload = {}) {
  const maxChars = P.boundedPageChars(payload.maxChars || P.DEFAULT_PAGE_CHARS);
  const worker = meta.worker || {};
  const receipt = meta.receipt || {};
  return ResponseV8.compactTrust({
    ...meta,
    ok:true,
    action:'commandStatus',
    requestAction:payload.requestAction || 'commandStatus',
    actualAction:'commandStatus',
    running:meta.status === 'running',
    summary:meta.status === 'running' ? 'Command worker is still running.' : `Command worker finished with status ${meta.status}.`,
    next:meta.status === 'running' ? `Poll commandJobStatus again or fetch output pages for ${jobId}.` : `Fetch commandJobOutputPage for stdout or stderr from ${jobId}.`,
    trust:'Status is read from the command receipt and paged output store without blocking the tunnel event loop.',
    worker,
    receipt,
    evidence:WorkerProtocol.evidenceFor(worker, receipt),
    ...payloads(jobId, maxChars)
  });
}
async function page(config, jobId, stream, payload = {}) {
  const text = await Paths.readText(config, jobId, `${stream}.txt`), offset = Math.max(0, Math.floor(Number(payload.offsetChars || payload.offset || 0))), maxChars = P.boundedPageChars(payload.maxChars || payload.pageChars || P.DEFAULT_PAGE_CHARS), content = text.slice(offset, offset + maxChars), next = offset + content.length < text.length ? offset + content.length : null;
  return { BH:'B"H', ok:true, action:'commandJobOutputPage', jobId, stream, offsetChars:offset, returnedChars:content.length, totalChars:text.length, content, hasNextPage:next !== null, nextOffsetChars:next, nextPagePayload:next === null ? null : { action:'commandJobOutputPage', jobId, stream, offsetChars:next, maxChars } };
}
function payloads(jobId, maxChars = P.DEFAULT_PAGE_CHARS) { return { statusPayload:{ action:'commandStatus', jobId }, waitPayload:{ action:'commandWait', jobId, waitTimeoutMs:P.waitCapMs(), pollIntervalMs:1000, inlineOutput:false }, stdoutPagePayload:{ action:'commandJobOutputPage', jobId, stream:'stdout', offsetChars:0, maxChars }, stderrPagePayload:{ action:'commandJobOutputPage', jobId, stream:'stderr', offsetChars:0, maxChars } }; }
function instruction(storage = {}) { return `Command output is paged from dedicated tunnel storage outside the repo. Do not request huge inline output; use output pages and write long artifacts only to ignored dedicated folders. Storage: ${storage.folder || 'device-state'}`; }
module.exports = { start, status, page, payloads, instruction };
