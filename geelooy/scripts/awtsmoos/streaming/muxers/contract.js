// B"H
function muxerContract() {
  return {
    input: 'EncodedVideoChunk + EncodedAudioChunk or already-muxed segment bytes',
    output: 'HLS media segments plus playlist metadata',
    requiredMethods: ['start(config)', 'pushVideo(chunk, meta)', 'pushAudio(chunk, meta)', 'flushSegment()', 'stop()'],
    currentImplementation: 'pass-through muxed segment adapter until TS/fMP4 muxer lands'
  };
}
function assertSegment(segment = {}) {
  if (!segment.bytes) throw new Error('segment_bytes_required');
  return segment;
}
module.exports = { muxerContract, assertSegment };
