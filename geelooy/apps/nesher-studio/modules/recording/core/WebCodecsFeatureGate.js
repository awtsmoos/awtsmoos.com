/* B"H
WebCodecs feature gate: before the studio promises speed, it asks the browser what exists.
*/
export function webCodecsFeatureGate(scope = globalThis) {
  return {
    videoEncoder:typeof scope.VideoEncoder === 'function',
    videoFrame:typeof scope.VideoFrame === 'function',
    audioEncoder:typeof scope.AudioEncoder === 'function',
    audioData:typeof scope.AudioData === 'function',
    trackProcessor:typeof scope.MediaStreamTrackProcessor === 'function',
    worker:typeof scope.Worker === 'function',
    offscreenCanvas:typeof scope.OffscreenCanvas === 'function'
  };
}
export function canRunManualVideo(scope = globalThis) {
  const gate = webCodecsFeatureGate(scope);
  return gate.videoEncoder && gate.videoFrame;
}
export function canRunWorkerEncoding(scope = globalThis) {
  const gate = webCodecsFeatureGate(scope);
  return gate.worker && gate.offscreenCanvas && gate.videoEncoder;
}
