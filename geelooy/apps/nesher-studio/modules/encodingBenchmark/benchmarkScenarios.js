/* B"H
Benchmark scenarios: small, honest vessels for comparing browser encoders quickly.
*/
export const DEFAULT_BENCHMARK_SCENARIOS = [
  scenario('vp8-360p', 'VP8 360p live preview', 640, 360, 'vp8', 2_000_000),
  scenario('vp8-720p', 'VP8 720p export preview', 1280, 720, 'vp8', 4_000_000),
  scenario('vp9-360p', 'VP9 360p compression check', 640, 360, 'vp09.00.10.08', 1_600_000),
  scenario('h264-360p', 'H.264 360p compatibility check', 640, 360, 'avc1.42E01E', 2_000_000)
];
export function scenario(id, label, width, height, codec, bitrate, fps = 30, seconds = 1) {
  return { id, label, width, height, codec, bitrate, fps, seconds };
}
export function quickScenarioFromState(state) {
  return scenario('current-canvas', 'Current canvas VP8', Math.min(state.width || 640, 1280), Math.min(state.height || 360, 720), 'vp8', 2_000_000, state.fps || 30, 2);
}
