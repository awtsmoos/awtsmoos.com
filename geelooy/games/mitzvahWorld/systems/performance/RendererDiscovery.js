// B"H
/** Bounded renderer revelation: find the WebGL vessel without searching infinity. */
const REPORT_KEY = "__AWTSMOOS_RENDERER_DISCOVERY__";
const isObject = value => Boolean(value) && (typeof value === "object" || typeof value === "function");

export function looksLikeRenderer(value) {
  if (!isObject(value)) return false;
  const core = typeof value.setPixelRatio === "function" && typeof value.render === "function";
  const canvas = isObject(value.domElement) || typeof value.getContext === "function";
  const marks = "shadowMap" in value || "info" in value || typeof value.setSize === "function";
  return Boolean(core && (canvas || marks));
}

function safeEvent(win, name, detail) {
  const C = win?.CustomEvent || globalThis.CustomEvent;
  if (typeof C === "function") return new C(name, { detail });
  const E = win?.Event || globalThis.Event;
  const event = typeof E === "function" ? new E(name) : { type: name };
  event.detail = detail;
  return event;
}

function seed(win) {
  return [
    ["__AWTSMOOS_RENDERER__", win?.__AWTSMOOS_RENDERER__], ["renderer", win?.renderer],
    ["mana", win?.mana], ["__AWTSMOOS_MANAGER__", win?.__AWTSMOOS_MANAGER__],
    ["olam", win?.olam], ["ikar", win?.ikar], ["activeWorld", win?.mana?.activeWorld]
  ].filter(([, value]) => isObject(value)).map(([path, value]) => ({ path, value, depth: 0 }));
}

function children(value) {
  try { return Object.keys(value).slice(0, 64).map(key => [key, value[key]]); }
  catch { return []; }
}

export function exposeRenderer(renderer, win = globalThis.window) {
  if (!looksLikeRenderer(renderer) || !win) return false;
  win.__AWTSMOOS_RENDERER__ = renderer;
  win.dispatchEvent?.(safeEvent(win, "awtsmoos:renderer-ready", { renderer }));
  return true;
}

export function discoverRenderer(win = globalThis.window, options = {}) {
  const queue = seed(win);
  const seen = new WeakSet();
  const report = { found: false, path: null, visited: 0, roots: queue.map(item => item.path) };
  const maxNodes = options.maxNodes || 900;
  const maxDepth = options.maxDepth || 7;
  while (queue.length && report.visited < maxNodes) {
    const item = queue.shift();
    if (!isObject(item.value) || seen.has(item.value) || item.value === win || item.value === win?.document) continue;
    seen.add(item.value); report.visited += 1;
    if (looksLikeRenderer(item.value)) {
      report.found = true; report.path = item.path; win && (win[REPORT_KEY] = report);
      exposeRenderer(item.value, win); return { renderer: item.value, report };
    }
    if (item.depth >= maxDepth) continue;
    for (const [key, child] of children(item.value)) if (isObject(child) && !seen.has(child)) queue.push({ path: `${item.path}.${key}`, value: child, depth: item.depth + 1 });
  }
  win && (win[REPORT_KEY] = report);
  return { renderer: null, report };
}

export default discoverRenderer;
