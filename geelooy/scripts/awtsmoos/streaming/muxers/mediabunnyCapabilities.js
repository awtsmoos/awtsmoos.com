// B"H
function mediabunnyStreamingCapabilities() {
  return {
    checkedLibrary: '/scripts/awtsmoos/video/mediabunny-library.js',
    observedExports: ['Mp4OutputFormat', 'VideoSampleSource', 'AudioBufferSource', 'StreamTarget', 'BufferTarget'],
    observedMp4Options: { fastStartFragmented: true, minimumFragmentDuration: true },
    hlsPlaylistMuxing: false,
    mpegTsMuxing: false,
    directWebCodecsChunkMuxing: 'unverified',
    usableNextStep: 'Build a fragmented MP4/CMAF adapter and feed its real segments into the local HLS session.'
  };
}
function makeFragmentedMp4FormatOptions(options = {}) {
  return {
    fastStart: 'fragmented',
    minimumFragmentDuration: Number(options.minimumFragmentDuration || options.targetDuration || 2)
  };
}
module.exports = { mediabunnyStreamingCapabilities, makeFragmentedMp4FormatOptions };
