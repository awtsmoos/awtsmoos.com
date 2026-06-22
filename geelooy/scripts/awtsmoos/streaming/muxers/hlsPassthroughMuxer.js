// B"H
const { assertSegment } = require('./contract.js');
function createHlsPassthroughMuxer(config = {}) {
  let index = 0;
  let started = false;
  return { start, pushMuxedSegment, flushSegment, stop };
  function start() { started = true; return { ok:true, config }; }
  function pushMuxedSegment(segment = {}) {
    if (!started) start();
    const clean = assertSegment(segment);
    return { index:index++, name:clean.name, duration:clean.duration || config.targetDuration || 2, bytes:clean.bytes, contentType:clean.contentType || 'video/mp2t' };
  }
  function flushSegment() { return null; }
  function stop() { started = false; return { ok:true, segments:index }; }
}
module.exports = { createHlsPassthroughMuxer };
