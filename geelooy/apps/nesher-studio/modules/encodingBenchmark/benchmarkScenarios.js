/* B"H
Benchmark scenarios: honest vessels for comparing browser encoders quickly.
*/
export const DEFAULT_BENCHMARK_SCENARIOS = [
  scenario('vp8-360p', 'VP8 360p live preview', 640, 360, 'vp8', 2_000_000),
  scenario('vp8-720p', 'VP8 720p export preview', 1280, 720, 'vp8', 4_000_000),
  scenario('vp9-360p', 'VP9 360p compression check', 640, 360, 'vp09.00.10.08', 1_600_000),
  scenario('h264-360p', 'H.264 360p compatibility check', 640, 360, 'avc1.42E01E', 2_000_000)
];
export const SMOKE_BENCHMARK_SCENARIOS = [
  scenario('smoke-vp8-160p', 'Smoke VP8 tiny realtime check', 256, 144, 'vp8', 400_000, 12, .25),
  scenario('smoke-h264-160p', 'Smoke H.264 tiny capability check', 256, 144, 'avc1.42E01E', 500_000, 12, .25)
];
export function scenario(id, label, width, height, codec, bitrate, fps = 30, seconds = 1) { return { id, label, width, height, codec, bitrate, fps, seconds }; }
export function quickScenarioFromState(state) { return scenario('current-canvas', 'Current canvas VP8', Math.min(state.width || 640, 1280), Math.min(state.height || 360, 720), 'vp8', 2_000_000, state.fps || 30, 2); }
export function smokeScenarioFromState(state) { return scenario('current-smoke', 'Current canvas smoke VP8', Math.min(state.width || 256, 426), Math.min(state.height || 144, 240), 'vp8', 500_000, Math.min(state.fps || 12, 15), .25); }
