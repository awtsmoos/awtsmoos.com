// B"H
const fsp = require('fs/promises');
const Paths = require('./paths.js');
const P = require('./policy.js');
function trimNote(stream, omitted) { return `\n[Awtsmoos tunnel kept only the last ${P.STREAM_MAX_BYTES} bytes of ${stream}; ${omitted} older bytes were omitted. Use quieter commands or redirect full logs to your own ignored artifact path.]\n`; }
async function append(config, jobId, stream, chunk, live) {
  const text = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk || '');
  if (live) live.meta[`${stream}Chars`] = Number(live.meta[`${stream}Chars`] || 0) + text.length;
  const write = enqueue(config, jobId, stream, text, live);
  if (live) { live.writes.push(write); write.finally(() => { live.writes = live.writes.filter(x => x !== write); }); }
  await write;
}
function enqueue(config, jobId, stream, text, live) {
  const next = (live?.chains?.[stream] || Promise.resolve()).then(() => appendBounded(config, jobId, stream, text)).catch(() => {});
  if (live) live.chains[stream] = next.catch(() => {});
  return next;
}
async function appendBounded(config, jobId, stream, text) {
  const file = Paths.jobFile(config, jobId, `${stream}.txt`);
  await fsp.appendFile(file, text, 'utf8');
  const bytes = await Paths.sizeOf(file);
  if (bytes <= P.STREAM_MAX_BYTES) return;
  const keep = await fsp.readFile(file, 'utf8');
  const omitted = Math.max(0, keep.length - P.STREAM_MAX_BYTES);
  await fsp.writeFile(file, trimNote(stream, omitted) + keep.slice(-P.STREAM_MAX_BYTES), 'utf8');
}
async function waitForWrites(jobId, jobs) { const live = jobs.get(jobId); if (live?.writes?.length) await Promise.allSettled([...live.writes]); }
module.exports = { append, appendBounded, waitForWrites };
