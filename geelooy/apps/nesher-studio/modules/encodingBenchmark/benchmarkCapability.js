/* B"H
Benchmark capability: ask the browser honestly before timing the vessel.
*/
export async function verifyEncodingCapability(scenario) {
  if (!globalThis.VideoEncoder?.isConfigSupported) return unavailable(scenario, 'VideoEncoder support probe unavailable');
  const config = { codec:scenario.codec, width:scenario.width, height:scenario.height, bitrate:scenario.bitrate, framerate:scenario.fps, latencyMode:'realtime' };
  try { const result = await VideoEncoder.isConfigSupported(config); return { scenarioId:scenario.id, codec:scenario.codec, supported:!!result.supported, config:result.config || config, reason:result.supported ? '' : 'config unsupported' }; }
  catch (e) { return unavailable(scenario, e.message); }
}
export async function verifyEncodingCapabilities(scenarios = []) { return Promise.all(scenarios.map(verifyEncodingCapability)); }
function unavailable(scenario, reason) { return { scenarioId:scenario.id, codec:scenario.codec, supported:false, config:null, reason }; }
