/* B"H
Stream stats formatting: the numbers become small readable sparks.
*/
export function formatBytes(bytes = 0) {
  const n = Math.max(0, Number(bytes) || 0);
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(2)} MB`;
}
export function formatRate(bytesPerSecond = 0) {
  const bits = Math.max(0, Number(bytesPerSecond) || 0) * 8;
  return bits < 1_000_000 ? `${(bits / 1000).toFixed(1)} kbps` : `${(bits / 1_000_000).toFixed(2)} Mbps`;
}
export function formatFps(frames = 0, elapsedMs = 1) {
  return `${(Number(frames || 0) * 1000 / Math.max(1, elapsedMs)).toFixed(1)} fps`;
}
export function streamVerdict({ state, errors = 0, frames = 0, segments = 0 } = {}) {
  if (state === 'Failed' || errors > 0) return 'needs attention';
  if (state === 'Running' && frames > 0 && segments > 0) return 'healthy';
  if (state === 'Running') return 'warming up';
  return String(state || 'idle').toLowerCase();
}
