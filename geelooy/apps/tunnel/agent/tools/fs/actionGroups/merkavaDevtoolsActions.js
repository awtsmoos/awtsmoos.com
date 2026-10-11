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
 *   merkavaInteractionRecord  — record a scripted user-interaction session
 *   merkavaInteractionDo      — apply one live interaction to a session
 *   merkavaInteractionPlay    — play the interaction journal forwards/backwards
 *   merkavaInteractionTimeline — list all recorded interactions w/ timestamps+perf
 *   merkavaInteractionGoto    — jump to interaction N (restore that DOM state)
 *   merkavaLiveVariables      — variable values now + across the interaction journal
 *   merkavaInteractionDiff    — DOM diff between two interaction points
 *   merkavaInteractionSessions — list open interaction sessions
 *   merkavaInteractionClose   — close an interaction session
 */
const path = require("path");
const { pathToFileURL } = require("url");

let sessionModulePromise = null;
/* Self-contained Merkava runtime (Yaakov 2026-10-11 hard rule: no repo). */
const SelfContained = require("../../../lib/selfContained.js");
let merkavaRootPromise = null;
function merkavaRoot() {
  if (!merkavaRootPromise) merkavaRootPromise = SelfContained.ensureBundle("merkava");
  return merkavaRootPromise;
}
let interactionModulePromise = null;
async function devtoolsUrl(rel) {
  const root = await merkavaRoot();
  return pathToFileURL(
    path.resolve(root, "scripts/awtsmoos/MerkavaExecutor/merkava-service/snapshots/devtools", rel)
  ).href;
}
async function loadSessionModule() {
  if (!sessionModulePromise) sessionModulePromise = import(await devtoolsUrl("devtoolsSession.js"));
  return await sessionModulePromise;
}
async function loadInteractionModule() {
  if (!interactionModulePromise) interactionModulePromise = import(await devtoolsUrl("interactionRecorder.js"));
  return await interactionModulePromise;
}

// Interaction sessions live in the tunnel action host (separate registry from
// the VM-debug sessions, because they journal InputSimulator-level state).
const interactionSessions = new Map();
let interactionSeq = 1;

function needInteraction(id) {
  const s = interactionSessions.get(String(id));
  if (!s) throw new Error(`[merkavaDevtools] no such interaction session: ${id}`);
  return s;
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
    },

    /* ---------------- interaction replay ---------------- */

    async merkavaInteractionRecord() {
      const im = await loadInteractionModule();
      const id = `int-${interactionSeq++}-${Date.now().toString(36)}`;
      const rec = new im.InteractionRecorder(payload.html || "<body><h1>Merkava</h1></body>", {
        width: Number(payload.width) || 960,
        height: Number(payload.height) || 700,
        label: payload.label || "tunnel-interaction"
      });
      // Optionally attach live VM variables from a DevTools debug session.
      let probed = false;
      if (payload.debugSessionId) {
        const m = await mod(); ctx._devtools = m;
        const dbg = needSession(ctx, payload.debugSessionId);
        rec.attachVarProbe(() => dbg.getVariables());
        probed = true;
      }
      interactionSessions.set(id, { id, rec, createdAt: new Date().toISOString(), probed });
      const applied = [];
      for (const step of (payload.interactions || [])) {
        const { action, ...args } = step;
        applied.push(rec.do(action, args));
      }
      return {
        ok: true, action: "merkavaInteractionRecord", interactionSessionId: id,
        probed, recorded: applied.length, currentIndex: rec.currentIndex,
        timeline: rec.timeline()
      };
    },

    async merkavaInteractionDo() {
      const s = needInteraction(payload.interactionSessionId);
      const { action, interactionSessionId, ...args } = payload;
      const summary = s.rec.do(action, args);
      return { ok: true, action: "merkavaInteractionDo", interactionSessionId: s.id, ...summary };
    },

    async merkavaInteractionPlay() {
      const s = needInteraction(payload.interactionSessionId);
      const direction = String(payload.direction || "forward").toLowerCase();
      const steps = Math.max(1, Math.min(10000, Number(payload.steps) || 1));
      const r = direction === "backward" ? s.rec.playBackward(steps) : s.rec.playForward(steps);
      return { ok: true, action: "merkavaInteractionPlay", interactionSessionId: s.id, ...r };
    },

    async merkavaInteractionTimeline() {
      const s = needInteraction(payload.interactionSessionId);
      return {
        ok: true, action: "merkavaInteractionTimeline", interactionSessionId: s.id,
        currentIndex: s.rec.currentIndex, count: s.rec.interactions.length,
        createdAt: s.createdAt, probed: s.probed,
        timeline: s.rec.timeline()
      };
    },

    async merkavaInteractionGoto() {
      const s = needInteraction(payload.interactionSessionId);
      const r = s.rec.goto(Number(payload.index));
      return { ok: true, action: "merkavaInteractionGoto", interactionSessionId: s.id, ...r };
    },

    async merkavaLiveVariables() {
      const s = needInteraction(payload.interactionSessionId);
      const lv = s.rec.liveVariables();
      let watch = null;
      if (payload.expr && s.probed) {
        // Expression evaluation lives on the attached debug session (merkavaWatch).
        watch = { expr: payload.expr, note: "use merkavaWatch on the debug session for expression evaluation" };
      }
      return { ok: true, action: "merkavaLiveVariables", interactionSessionId: s.id, ...lv, watch };
    },

    async merkavaInteractionDiff() {
      const s = needInteraction(payload.interactionSessionId);
      const from = payload.from === -1 || payload.from === "-1" ? -1 : Number(payload.from);
      const to = payload.to === -1 || payload.to === "-1" ? -1 : Number(payload.to);
      return { ok: true, action: "merkavaInteractionDiff", interactionSessionId: s.id, ...s.rec.diff(from, to) };
    },

    async merkavaInteractionSessions() {
      return {
        ok: true, action: "merkavaInteractionSessions",
        sessions: [...interactionSessions.values()].map((s) => ({
          id: s.id, createdAt: s.createdAt, probed: s.probed,
          interactions: s.rec.interactions.length, currentIndex: s.rec.currentIndex
        }))
      };
    },

    async merkavaInteractionClose() {
      const id = String(payload.interactionSessionId);
      return { ok: true, action: "merkavaInteractionClose", closed: interactionSessions.delete(id) };
    }
  };
}

module.exports = { buildMerkavaDevtoolsActions };
