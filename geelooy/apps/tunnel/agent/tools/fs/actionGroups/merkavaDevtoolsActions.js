// B"H
/**
 * Merkava DevTools tunnel actions.
 *
 * Exposes the DevTools (time-travel debugger, variable inspector, network
 * panel, profiler, elements inspector) as native Awtsmoos tunnel actions so
 * AI agents can drive them through the tunnel and the Awtsmoos API.
 *
 * Actions:
 *   merkavaDebugRecord      — record a page session (HTML+JS) with all recorders
 *   merkavaDebugStepBack    — step the session's thread one instruction back
 *   merkavaDebugStepForward — step forward
 *   merkavaDebugGotoStep    — jump to an exact step
 *   merkavaGetVariables     — all variables at all scopes at the current step
 *   merkavaWatch            — evaluate a watch expression against scope chain
 *   merkavaDebugHistory     — opcode histogram + timing summary
 *   merkavaGetProfile       — profiler report (top opcodes, flame graph, memory)
 *   merkavaInspectElement   — DOM element detail + layout box
 *   merkavaComputedStyle    — computed style for an element
 *   merkavaListNetworkRequests — recorded network requests
 *   merkavaDebugSessions    — list open sessions
 *   merkavaDebugClose       — close a session
 */
const path = require("path");
const { pathToFileURL } = require("url");

let sessionModulePromise = null;
function devtoolsUrl(rel) {
  return pathToFileURL(
    path.resolve(__dirname, "../../../../../../scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/devtools", rel)
  ).href;
}
async function loadSessionModule() {
  if (!sessionModulePromise) sessionModulePromise = import(devtoolsUrl("devtoolsSession.js"));
  return await sessionModulePromise;
}

function needSession(ctx, id) {
  const { getSession } = ctx._devtools;
  const s = getSession(id);
  if (!s) throw new Error(`[merkavaDevtools] no such session: ${id}`);
  return s;
}

function buildMerkavaDevtoolsActions(ctx) {
  const { payload } = ctx;
  const mod = () => loadSessionModule();

  return {
    async merkavaDebugRecord() {
      const m = await mod();
      const s = await m.recordSession({
        html: payload.html || "",
        js: payload.js || payload.script || "",
        width: Number(payload.width) || 800,
        height: Number(payload.height) || 600,
        maxSteps: Math.min(200000, Number(payload.maxSteps) || 50000),
        label: payload.label || "tunnel-debug"
      });
      ctx._devtools = m;
      return {
        ok: true, action: "merkavaDebugRecord",
        sessionId: s.id, steps: s.steps, status: s.result.status,
        wallMs: s.result.wallMs,
        summary: s.timeTravel.summarize()
      };
    },

    async merkavaDebugStepBack() {
      const m = await mod(); ctx._devtools = m;
      const s = needSession(ctx, payload.sessionId);
      return { ok: true, action: "merkavaDebugStepBack", sessionId: s.id, ...s.stepBack() };
    },

    async merkavaDebugStepForward() {
      const m = await mod(); ctx._devtools = m;
      const s = needSession(ctx, payload.sessionId);
      return { ok: true, action: "merkavaDebugStepForward", sessionId: s.id, ...s.stepForward() };
    },

    async merkavaDebugGotoStep() {
      const m = await mod(); ctx._devtools = m;
      const s = needSession(ctx, payload.sessionId);
      const n = payload.step === -1 || payload.step === "-1" ? -1 : Number(payload.step);
      return { ok: true, action: "merkavaDebugGotoStep", sessionId: s.id, ...s.gotoStep(n) };
    },

    async merkavaGetVariables() {
      const m = await mod(); ctx._devtools = m;
      const s = needSession(ctx, payload.sessionId);
      return { ok: true, action: "merkavaGetVariables", sessionId: s.id, ...s.getVariables() };
    },

    async merkavaWatch() {
      const m = await mod(); ctx._devtools = m;
      const s = needSession(ctx, payload.sessionId);
      return { ok: true, action: "merkavaWatch", sessionId: s.id, expr: payload.expr, ...s.watch(payload.expr) };
    },

    async merkavaDebugHistory() {
      const m = await mod(); ctx._devtools = m;
      const s = needSession(ctx, payload.sessionId);
      return { ok: true, action: "merkavaDebugHistory", sessionId: s.id, ...s.history() };
    },

    async merkavaGetProfile() {
      const m = await mod(); ctx._devtools = m;
      const s = needSession(ctx, payload.sessionId);
      const report = s.profiler.report();
      const out = { ok: true, action: "merkavaGetProfile", sessionId: s.id, ...report };
      if (payload.flame) out.flameGraph = s.profiler.flameGraph();
      if (payload.memory) out.memoryTimeline = s.profiler.memoryTimeline().slice(-50);
      return out;
    },

    async merkavaInspectElement() {
      const m = await mod(); ctx._devtools = m;
      const s = needSession(ctx, payload.sessionId);
      if (payload.selector) {
        const hits = s.elements.querySelector(payload.selector);
        return { ok: true, action: "merkavaInspectElement", sessionId: s.id, matches: hits };
      }
      const detail = s.elements.inspect(Number(payload.devId));
      if (!detail) throw new Error(`[merkavaDevtools] no element devId=${payload.devId}`);
      return { ok: true, action: "merkavaInspectElement", sessionId: s.id, ...detail };
    },

    async merkavaComputedStyle() {
      const m = await mod(); ctx._devtools = m;
      const s = needSession(ctx, payload.sessionId);
      return {
        ok: true, action: "merkavaComputedStyle", sessionId: s.id,
        devId: Number(payload.devId), computed: s.elements.computedStyle(Number(payload.devId))
      };
    },

    async merkavaListNetworkRequests() {
      const m = await mod(); ctx._devtools = m;
      const s = needSession(ctx, payload.sessionId);
      return {
        ok: true, action: "merkavaListNetworkRequests", sessionId: s.id,
        stats: s.network.stats(),
        requests: s.network.list({ method: payload.method, url: payload.url, failed: payload.failed })
      };
    },

    async merkavaDebugSessions() {
      const m = await mod(); ctx._devtools = m;
      return { ok: true, action: "merkavaDebugSessions", sessions: m.listSessions() };
    },

    async merkavaDebugClose() {
      const m = await mod(); ctx._devtools = m;
      return { ok: true, action: "merkavaDebugClose", closed: m.closeSession(payload.sessionId) };
    }
  };
}

module.exports = { buildMerkavaDevtoolsActions };
