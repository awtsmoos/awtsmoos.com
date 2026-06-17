// B"H
export function fastUiMode(win = globalThis.window) {
  const width = Number(win?.innerWidth || 1024);
  const height = Number(win?.innerHeight || 768);
  const mobile = width <= 820 || height <= 720;
  return { mobile, compact:mobile, noHeavyBlur:mobile, maxDomAnimation:mobile ? 0 : 2 };
}
export default fastUiMode;
