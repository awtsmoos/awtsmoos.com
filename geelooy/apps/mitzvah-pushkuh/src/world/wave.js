// B"H
// Motion is memorized song: cheap waves instead of per-frame calculation.
const N = 512;
const TABLE = Array.from({ length: N }, (_, i) => Math.sin((i / N) * Math.PI * 2));
export function wave(x = 0) {
  return TABLE[((x * 81.487) | 0) & (N - 1)];
}
export function pulse(t, seed = 0, amp = 1, mid = 0) {
  return mid + wave(t + seed) * amp;
}
