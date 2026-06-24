/* B"H
CodecCapabilities is the truthful gatekeeper. It can describe browser support
without pretending an encoder exists when Node or Safari says no.
*/
export function createCodecCapabilities(input = {}) {
  return { kind:'CodecCapabilities', video:input.video || [], audio:input.audio || [], checkedAt:input.checkedAt || null, environment:input.environment || runtimeEnvironment() };
}
export async function probeCodecCapabilities(options = {}) {
  const caps = createCodecCapabilities(); caps.checkedAt = Date.now();
  caps.video = await probeMany('VideoEncoder', options.video || [{ codec:'avc1.42E01F', width:1280, height:720, bitrate:2500000, framerate:30 }, { codec:'vp09.00.10.08', width:1280, height:720, bitrate:2500000, framerate:30 }]);
  caps.audio = await probeMany('AudioEncoder', options.audio || [{ codec:'mp4a.40.2', sampleRate:48000, numberOfChannels:2, bitrate:128000 }, { codec:'opus', sampleRate:48000, numberOfChannels:2, bitrate:96000 }]);
  return caps;
}
export function summarizeCapabilities(caps) { return { video:caps.video.filter(x=>x.supported).map(x=>x.codec), audio:caps.audio.filter(x=>x.supported).map(x=>x.codec), environment:caps.environment }; }
async function probeMany(encoderName, configs) { return Promise.all(configs.map(config => probeOne(encoderName, config))); }
async function probeOne(encoderName, config) {
  const ctor = globalThis[encoderName];
  if (!ctor?.isConfigSupported) return { codec:config.codec, supported:false, reason:`${encoderName}_unavailable`, config };
  try { const out = await ctor.isConfigSupported(config); return { codec:config.codec, supported:!!out.supported, reason:out.supported ? 'supported' : 'not_supported', config:out.config || config }; }
  catch (e) { return { codec:config.codec, supported:false, reason:e.message || String(e), config }; }
}
function runtimeEnvironment() { return { hasVideoEncoder:!!globalThis.VideoEncoder, hasAudioEncoder:!!globalThis.AudioEncoder, hasVideoFrame:!!globalThis.VideoFrame, userAgent:globalThis.navigator?.userAgent || 'node' }; }
