// B"H
export function viewportMode(win = globalThis.window) {
  const width = Number(win?.innerWidth || 0), height = Number(win?.innerHeight || 0);
  const portrait = height >= width;
  const mobile = width <= 820 || height <= 720;
  return { width, height, portrait, mobile, desktop:!mobile, safeBottom:"env(safe-area-inset-bottom, 0px)" };
}
export default viewportMode;
