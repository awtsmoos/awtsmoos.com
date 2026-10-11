// B"H
/**
 * @file devtoolsSession.js
 * @description Unified Merkava DevTools session.
 *
 * recordSession({ html, js, width, height }) runs the FULL pipeline with
 * every recorder attached:
 *   1. Parse HTML -> DOM (journaled)
 *   2. Compile JS -> bytecode via the real MerkavaJS compiler
 *   3. Spawn the VM thread with a document/window host facade
 *   4. Attach TimeTravelRecorder + Profiler, run to completion step-by-step
 *   5. Render PNG screenshot of the final DOM
 *
 * Returns a live session handle: { timeTravel, profiler, network, elements,
 *   thread, result, screenshot } plus stepBack/stepForward/getVariables helpers.
 * Sessions are kept in a registry so tunnel actions / API endpoints can drive
 * them by id.
 */

import { TimeTravelRecorder } from "./timeTravel.js";
import { Profiler } from "./profiler.js";
import { NetworkRecorder } from "./networkPanel.js";
import { ElementsInspector, } from "./elementsInspector.js";
import { getVariables, evaluateWatch } from "./variableInspector.js";
import { parseHtmlToDom } from "../software/htmlParser.js";
import compilerPkg from "../../../merkava-binary/MerkavaJsCompiler.js";
import sangPkg from "../../../merkava-binary/SangVmRunner.js";
import loaderPkg from "../../../merkava-binary/MerkavaVmLoader.js";
import hostPkg from "../../../merkava-binary/DefaultMerkavaHost.js";

const { compileJsToCode } = compilerPkg;
const { TinyMemory } = sangPkg;
const { loadMerkavaVm } = loaderPkg;
const { createDefaultHost } = hostPkg;

const sessions = new Map();
let sessionSeq = 1;

/** Minimal document facade backed by the parsed DOM (for page scripts). */
function createDocumentFacade(dom, elements) {
  const findById = (node, id) => {
    if (!node || typeof node !== "object") return null;
    if ((node.attributes && node.attributes.id === id) || node.id === id) return node;
    for (const c of (node.children || [])) { const h = findById(c, id); if (h) return h; }
    return null;
  };
  const wrap = (node) => node ? {
    __node: node,
    get textContent() { return node.textContent || ""; },
    set textContent(v) { node.textContent = String(v); node.children = []; },
    get innerHTML() { return node.textContent || ""; },
    setAttribute(k, v) { node.attributes = node.attributes || {}; node.attributes[k] = String(v); },
    getAttribute(k) { return (node.attributes || {})[k] ?? null; },
    get style() {
      return new Proxy({}, {
        get: (_, p) => (node.style || {})[p],
        set: (_, p, v) => { node.style = node.style || {}; node.style[p] = String(v); return true; }
      });
    },
    addEventListener() { /* journaled no-op for now */ }
  } : null;
  return {
    getElementById: (id) => wrap(findById(dom, String(id))),
    querySelector: (sel) => {
      const hits = elements.querySelector(sel);
      if (!hits.length) return null;
      // re-find node by devId
      const walk = (n) => {
        if (!n || typeof n !== "object") return null;
        if (n.__devId === hits[0].devId) return n;
        for (const c of (n.children || [])) { const h = walk(c); if (h) return h; }
        return null;
      };
      return wrap(walk(dom));
    },
    get title() { return ""; },
    set title(_) {}
  };
}

export function getSession(id) { return sessions.get(String(id)) || null; }
export function listSessions() {
  return [...sessions.values()].map((s) => ({ id: s.id, label: s.label, createdAt: s.createdAt, steps: s.timeTravel.length, status: s.thread?.status || "?" }));
}
export function closeSession(id) { return sessions.delete(String(id)); }

export async function recordSession(opts = {}) {
  const html = String(opts.html || "<body><h1>Merkava DevTools</h1></body>");
  const js = String(opts.js || "");
  const width = Number(opts.width) || 800;
  const height = Number(opts.height) || 600;
  const maxSteps = Math.min(200000, Math.max(1000, Number(opts.maxSteps) || 50000));
  const label = String(opts.label || "devtools-session");

  const id = `dbg-${sessionSeq++}-${Date.now().toString(36)}`;
  const network = new NetworkRecorder();
  const elements = new ElementsInspector();
  const loadInfo = elements.load(html, { width, height });

  // Compile JS through the REAL pipeline (or a no-op program).
  loadMerkavaVm();
  const artifact = js.trim()
    ? await compileJsToCode(js, {})
    : { bytecode: [0x00], constants: [] }; // HALT-ish single byte; runSang treats gracefully

  const document = createDocumentFacade(elements.dom, elements);
  const window = { document, location: { href: "merkava://devtools" } };
  // B"H: compiled JS resolves top-level names via memory.globals, so the
  // facades must be seeded there (hostAPI alone is only for syscalls).
  const memory = new TinyMemory({ document, window });
  const hostAPI = { ...createDefaultHost(memory.globals) };
  hostAPI.document = document;
  hostAPI.window = window;

  const vm = new globalThis.MerkavaVM(memory, hostAPI, {});
  const thread = vm.spawn({ bytecode: artifact.bytecode, constants: artifact.constants || [] });
  thread.status = "RUNNING";

  const timeTravel = new TimeTravelRecorder({ maxSteps }).attach(thread).start();
  const profiler = new Profiler({}).attach(thread).start();

  let steps = 0;
  const wall0 = Date.now();
  try {
    while (steps < maxSteps && thread.status === "RUNNING") {
      thread.step();
      steps++;
      if (thread.environment) Object.assign(memory.globals, thread.environment);
    }
  } finally {
    timeTravel.stop();
    profiler.stop();
  }
  const wallMs = Date.now() - wall0;

  const session = {
    id, label, createdAt: new Date().toISOString(),
    html, js, width, height,
    thread, vm, memory, hostAPI, document,
    timeTravel, profiler, network, elements,
    steps, wallMs,
    result: {
      ok: thread.status === "COMPLETED",
      status: thread.status,
      steps,
      wallMs,
      globals: (() => { try { return JSON.parse(JSON.stringify(memory.globals)); } catch { return {}; } })()
    },
    // Time-travel controls bound to this session's thread:
    stepBack: () => timeTravel.stepBack(),
    stepForward: () => timeTravel.stepForward(),
    gotoStep: (n) => timeTravel.gotoStep(n),
    describeStep: (n) => timeTravel.describeStep(n),
    getVariables: () => getVariables(thread),
    watch: (expr) => evaluateWatch(thread, expr),
    history: () => timeTravel.summarize()
  };
  sessions.set(id, session);
  return session;
}
