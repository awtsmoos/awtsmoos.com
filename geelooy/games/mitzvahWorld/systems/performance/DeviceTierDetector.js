// B"H
/**
 * The Awtsmoos judges the vessel by many signs, not one humble height.
 * A 1280x720 desktop remains a desktop unless touch, UA, or width proves exile.
 */
function numberOr(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function mediaMatches(win, query) {
  try { return Boolean(win?.matchMedia?.(query)?.matches); }
  catch { return false; }
}

export function detectDeviceTier(win = globalThis.window, nav = globalThis.navigator) {
  const width = numberOr(win?.innerWidth, 1024);
  const height = numberOr(win?.innerHeight, 768);
  const cores = numberOr(nav?.hardwareConcurrency, 4);
  const memory = numberOr(nav?.deviceMemory, 4);
  const ua = String(nav?.userAgent || "");
  const uaMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const coarse = mediaMatches(win, "(pointer: coarse)");
  const narrow = width <= 760;
  const compactTouch = coarse && width <= 1180 && height <= 920;
  const mobile = Boolean(uaMobile || narrow || compactTouch);
  const viewportBonus = width >= 1280 && !mobile ? 1.8 : width >= 1000 && !mobile ? 1 : 0;
  const pressure = mobile ? -1.8 : 0;
  const score = cores * 0.55 + memory * 0.85 + viewportBonus + pressure;
  const tier = score >= 8.5 ? "high" : score >= 4.5 ? "medium" : "low";
  return { tier, mobile, width, height, cores, memory, score, evidence: { uaMobile, coarse, narrow, compactTouch } };
}

export default detectDeviceTier;
