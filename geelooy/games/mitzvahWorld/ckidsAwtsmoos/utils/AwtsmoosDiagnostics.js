// B"H
/**
 * @file AwtsmoosDiagnostics.js
 * @description
 * Chapter 422: the logs become a copyable scroll instead of rain.
 *
 * The Awtsmoos gives memory a vessel: small ring buffers, compact summaries,
 * living-region proof objects, and one global copy function the user can paste
 * back when the village shakes.
 */
const MAX = 180;
const VERSION = "village-diagnostics-20260612-bh2";
const root = globalThis;
const state = root.__AWTSMOOS_DIAG_STATE__ ||= {
  version: VERSION,
  bootedAt: Date.now(),
  events: [],
  counters: {},
  lastNoticeAt: 0
};
state.version = VERSION;

function trim() {
  if (state.events.length > MAX) state.events.splice(0, state.events.length - MAX);
}

function safe(value) {
  try {
    return JSON.parse(JSON.stringify(value, (_, v) => typeof v === "number" ? Math.round(v * 1000) / 1000 : v));
  } catch (_) {
    return String(value);
  }
}

function livingRegionMain() {
  return root.AWTSMOOS_LIVING_REGION_MAIN || root.__AWTSMOOS_LIVING_REGION_MAIN__ || null;
}

function livingRegionStats(olam) {
  return root.AWTSMOOS_LIVING_REGION_STATS || olam?.__AWTSMOOS_LIVING_REGION_STATS__ || null;
}

function livingRegionReport(olam) {
  return root.AWTSMOOS_LIVING_REGION_REPORT || olam?.__AWTSMOOS_LIVING_REGION_REPORT__ || null;
}

export function diagEvent(kind, data = {}, level = "info") {
  const entry = { t: Date.now(), kind, level, data: safe(data) };
  state.events.push(entry);
  trim();
  state.counters[kind] = (state.counters[kind] || 0) + 1;
  return entry;
}

export function diagThrottle(kind, data = {}, ms = 1200, level = "info") {
  const key = `last_${kind}`;
  const now = Date.now();
  if (now - (state[key] || 0) < ms) return null;
  state[key] = now;
  return diagEvent(kind, data, level);
}

export function diagSnapshot(extra = {}) {
  const olam = root.olam || root.__awtsmoosOlam || null;
  const player = olam?.player || olam?.chossid || null;
  const p = player?.mesh?.position;
  return {
    version: state.version,
    at: new Date().toISOString(),
    ageMs: Date.now() - state.bootedAt,
    counters: { ...state.counters },
    workerProgress: root.__AWTSMOOS_WORKER_PROGRESS__ || null,
    livingRegion: {
      main: safe(livingRegionMain()),
      stats: safe(livingRegionStats(olam)),
      report: safe(livingRegionReport(olam)),
      debug: safe(root.AWTSMOOS_REGION_DEBUG || null)
    },
    player: player ? {
      name: player.name,
      hp: player.currentStats?.health,
      pos: p ? { x: p.x, y: p.y, z: p.z } : null,
      moving: player.moving,
      rotY: player.rotation?.y
    } : null,
    terrain: olam?.awtsmoosTerrainLaw ? {
      source: olam.awtsmoosTerrainLaw.source,
      width: olam.awtsmoosTerrainLaw.data?.width,
      depth: olam.awtsmoosTerrainLaw.data?.depth
    } : null,
    lastEvents: state.events.slice(-70),
    extra: safe(extra)
  };
}

export function installDiagnosticsNotice() {
  if (state.noticeInstalled) return;
  state.noticeInstalled = true;
  root.__AWTSMOOS_DIAG_COPY__ = (extra = {}) => JSON.stringify(diagSnapshot(extra), null, 2);
  root.AWTSMOOS_REGION_DEBUG ||= {};
  root.AWTSMOOS_REGION_DEBUG.copy = root.__AWTSMOOS_DIAG_COPY__;
  root.AWTSMOOS_REGION_DEBUG.snapshot = diagSnapshot;
  root.__AWTSMOOS_DIAG_STATE__ = state;
  const now = Date.now();
  if (now - state.lastNoticeAt > 8000) {
    state.lastNoticeAt = now;
    console.info('B"H | AWTSMOOS_DIAG_READY | copy this in console: __AWTSMOOS_DIAG_COPY__()');
  }
}

export function markFrameSpike(dt, context = {}) {
  if (dt > 0.045) diagThrottle("frame-spike", { dt, ...context }, 700, "warn");
}

installDiagnosticsNotice();
