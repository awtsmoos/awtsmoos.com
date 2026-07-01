// B"H
const Paths = require('./paths.js');
const P = require('./policy.js');
function start(jobId, details) { return { ok:true, action:'commandStart', jobId, status:'running', ...details, ...payloads(jobId), aiInstructions:instruction(details.storage) }; }
function status(jobId, meta, payload = {}) { const maxChars = P.boundedPageChars(payload.maxChars || P.DEFAULT_PAGE_CHARS); return { ...meta, ok:true, action:'commandStatus', running:meta.status === 'running', ...payloads(jobId, maxChars) }; }
async function page(config, jobId, stream, payload = {}) {
  const text = await Paths.readText(config, jobId, `${stream}.txt`), offset = Math.max(0, Math.floor(Number(payload.offsetChars || payload.offset || 0))), maxChars = P.boundedPageChars(payload.maxChars || payload.pageChars || P.DEFAULT_PAGE_CHARS), content = text.slice(offset, offset + maxChars), next = offset + content.length < text.length ? offset + content.length : null;
  return { BH:'B"H', ok:true, action:'commandJobOutputPage', jobId, stream, offsetChars:offset, returnedChars:content.length, totalChars:text.length, content, hasNextPage:next !== null, nextOffsetChars:next, nextPagePayload:next === null ? null : { action:'commandJobOutputPage', jobId, stream, offsetChars:next, maxChars } };
}
function payloads(jobId, maxChars = P.DEFAULT_PAGE_CHARS) { return { statusPayload:{ action:'commandStatus', jobId }, waitPayload:{ action:'commandWait', jobId, waitTimeoutMs:P.waitCapMs(), pollIntervalMs:1000, inlineOutput:false }, stdoutPagePayload:{ action:'commandJobOutputPage', jobId, stream:'stdout', offsetChars:0, maxChars }, stderrPagePayload:{ action:'commandJobOutputPage', jobId, stream:'stderr', offsetChars:0, maxChars } }; }
function instruction(storage = {}) { return `Command output is paged from dedicated tunnel storage outside the repo. Do not request huge inline output; use output pages and write long artifacts only to ignored dedicated folders. Storage: ${storage.folder || 'device-state'}`; }
module.exports = { start, status, page, payloads, instruction };
