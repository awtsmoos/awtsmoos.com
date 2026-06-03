// B"H
const fs = require("fs");
const path = require("path");
const http = require("http");
const { actions } = require("../../geelooy/api/tunnel/control/docs/actions.js");
const { dispatchOsFs } = require("../../geelooy/api/tunnel/control/routes/osFs/index.js");
const { supportAction } = require("../../geelooy/api/tunnel/control/routes/osFs/supportActions.js");
const { classifyVirtualAction, virtualSurfaceReport } = require("../../geelooy/api/tunnel/control/routes/osFs/virtualActionBridge.js");

const outDir = path.resolve(__dirname);
const rawPath = path.join(outDir, "virtual-os-full-stress-results.json");
const mdPath = path.join(outDir, "virtual-os-full-stress-report.md");
const userId = "stressUser_" + Date.now();

/**
 * B"H
 * Chapter 384: The Hosted Palace Was Tested Name By Name.
 *
 * This harness does not print keys. It lets the server-side MiniMax provider
 * code load its existing on-disk key, creates an isolated Virtual OS user/alias,
 * asks MiniMax for a tiny app, writes that app through Virtual OS write/read,
 * checks localhost:8080, and walks every documented tunnel action through the
 * bridge so the report separates native, AI, hosted, interpreted, and host-only.
 */
function makeDb() {
  const map = new Map([
    [`/users/${userId}/aliases/machine`, { aliasId: "machine", name: "Machine Stress Root" }]
  ]);
  return {
    async get(p) { return map.get(p); },
    async read(p) { return map.get(p); },
    async write(p, v = {}) { map.set(p, v); return { ok: true, path: p }; },
    async delete(p) { const had = map.delete(p); return { ok: true, deleted: had, path: p }; },
    dump() { return Object.fromEntries(map); }
  };
}
const $i = { db: makeDb(), ws: { clients: [] } };
function dispatch(payload) { return dispatchOsFs($i, userId, { ...payload, tunnelName: "awtsmoos-virtual-os", targetVessel: "virtual-os" }); }
function redact(value) { return JSON.parse(JSON.stringify(value, (key, val) => /apiKey|authorization|token|secret/i.test(key) ? "[REDACTED]" : val)); }
function safeError(error) { return { ok: false, error: error.message, status: error.status || 500, stackTop: String(error.stack || "").split("\n").slice(0, 2).join("\n") }; }
function httpGet(pathname) {
  return new Promise(resolve => {
    const req = http.request({ hostname: "127.0.0.1", port: 8080, path: pathname, method: "GET", timeout: 8000 }, res => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", chunk => body += chunk);
      res.on("end", () => resolve({ ok: true, status: res.statusCode, body: body.slice(0, 2000) }));
    });
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", e => resolve({ ok: false, error: e.message }));
    req.end();
  });
}
async function generateApp() {
  const prompt = "Create a single-file HTML app named Light Counter. Return only complete HTML. Include inline CSS and JS. Add a visible B'H marker and a button that increments a counter.";
  const got = await supportAction("aiAgentMessage", { action: "aiAgentMessage", provider: "minimax", agentId: "minimax-deep", model: "MiniMax-M2.7", message: prompt, stream: false }, dispatch);
  const text = String(got.text || got.content || "");
  const html = extractHtml(text) || fallbackApp(text);
  const write = await dispatch({ action: "write", path: "machine/apps/light-counter/index.html", content: html, confirm: true, dryRun: false });
  const read = await dispatch({ action: "read", path: "machine/apps/light-counter/index.html", maxChars: 20000 });
  return { minimax: redact({ ok: got.ok, provider: got.provider, agent: got.agent, model: got.model, textLength: text.length, error: got.error || null }), write: redact(write), readOk: read.ok !== false, appBytes: html.length, appPreview: html.slice(0, 300) };
}
function extractHtml(text) { const match = text.match(/<!doctype html[\s\S]*$/i) || text.match(/<html[\s\S]*<\/html>/i); return match ? match[0].trim() : ""; }
function fallbackApp(reason) { return `<!doctype html><html><head><meta charset="utf-8"><title>Light Counter</title><style>body{font-family:sans-serif;padding:2rem;background:#101827;color:white}button{font-size:1.2rem;padding:.8rem 1rem}</style></head><body><main><p>B'H</p><h1>Light Counter</h1><p id="count">0</p><button id="b">Add light</button><pre hidden>${escapeHtml(reason.slice(0, 800))}</pre></main><script>let n=0;b.onclick=()=>count.textContent=++n;</script></body></html>`; }
function escapeHtml(s) { return String(s).replace(/[&<>]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch])); }
function samplePayload(action) {
  const base = { action, path: "machine/apps/light-counter/index.html", p: "machine/apps/light-counter/index.html", maxChars: 1200, limit: 5, depth: 2, query: "Light", content: "B'H stress content", text: "B'H stress text", message: "Reply OK", prompt: "Reply OK", timeoutMs: 12000, dryRun: true };
  if (/List|Surface|Audit|Status/.test(action)) return { action, path: "machine", limit: 5 };
  if (/Write|write|Patch|Replace|Create|Save|Set|Remove|Delete/.test(action)) return { ...base, dryRun: true, confirm: false };
  if (action === "aiAgentMessage") return { action, provider: "minimax", agentId: "minimax-deep", model: "MiniMax-M2.7", message: "Reply with OK only.", stream: false };
  if (action.startsWith("aiAgent")) return { action, limit: 5 };
  if (/http|api|endpoint|oauth|network/i.test(action)) return { action, url: "http://127.0.0.1:8080/", timeoutMs: 8000 };
  if (/runtime|simulate|merkava|browser|chrome|preview/i.test(action)) return { action, html: "<main>B'H Runtime</main>", entry: "index.html", timeoutMs: 12000, maxChars: 1200 };
  return base;
}
async function stressAction(action) {
  const classification = classifyVirtualAction(action);
  const payload = samplePayload(action);
  const started = Date.now();
  try {
    let result;
    if (["list", "tree", "read", "stat", "fileHashes", "textStats", "jsonValidate", "packageInfo", "projectOverview", "recentFiles", "largeFiles", "duplicateBasenames", "routeAudit", "agentSelfTest", "architectureScore", "inferArchitecture", "detectAbstractionLeaks", "semanticSearch", "dependencyGraph", "connectedFiles"].includes(action)) result = await dispatch(payload);
    else result = await supportAction(action, payload, dispatch);
    return { action, classification, durationMs: Date.now() - started, result: summarizeResult(result) };
  } catch (error) {
    return { action, classification, durationMs: Date.now() - started, result: safeError(error) };
  }
}
function summarizeResult(result) {
  const clean = redact(result || {});
  return { ok: clean.ok !== false, action: clean.action, vessel: clean.vessel, resultType: clean.resultType, error: clean.error || null, mode: clean.mode || clean.classification?.mode || null, keys: Object.keys(clean).slice(0, 20), sample: JSON.stringify(clean).slice(0, 700) };
}
async function run() {
  fs.mkdirSync(outDir, { recursive: true });
  const serverRoot = await httpGet("/");
  const serverVirtual = await httpGet("/api/tunnel/control/fs/awtsmoos-virtual-os?action=capabilityParityAudit&targetVessel=virtual-os&p=machine&limit=5");
  const surface = virtualSurfaceReport();
  const app = await generateApp();
  const results = [];
  for (const action of actions) results.push(await stressAction(action));
  const counts = results.reduce((acc, row) => { const mode = row.classification.mode; acc[mode] = acc[mode] || { total: 0, ok: 0, fail: 0 }; acc[mode].total++; row.result.ok ? acc[mode].ok++ : acc[mode].fail++; return acc; }, {});
  const failures = results.filter(row => !row.result.ok).map(row => ({ action: row.action, mode: row.classification.mode, error: row.result.error, sample: row.result.sample })).slice(0, 80);
  const report = { ok: failures.length === 0, generatedAt: new Date().toISOString(), userId, server: { root: serverRoot, virtualRoute: serverVirtual }, surface: { total: surface.total, counts: surface.counts, fullyExecutable: surface.fullyExecutable, interpreted: surface.interpreted }, app, stress: { total: results.length, counts, failureCount: failures.length, failures, results } };
  fs.writeFileSync(rawPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(mdPath, markdown(report));
  console.log(JSON.stringify({ ok: true, rawPath, mdPath, total: results.length, failureCount: failures.length, counts, serverRoot: serverRoot.status || serverRoot.error, serverVirtual: serverVirtual.status || serverVirtual.error, appBytes: app.appBytes }, null, 2));
}
function markdown(report) { return [`B"H`, `# Virtual OS full tunnel stress`, ``, `Generated: ${report.generatedAt}`, `User: ${report.userId}`, ``, `## Server`, `- / status: ${report.server.root.status || report.server.root.error}`, `- Virtual route status: ${report.server.virtualRoute.status || report.server.virtualRoute.error}`, ``, `## MiniMax app`, `- MiniMax ok: ${report.app.minimax.ok}`, `- App bytes: ${report.app.appBytes}`, `- Read back ok: ${report.app.readOk}`, ``, `## Surface`, "```json", JSON.stringify(report.surface, null, 2), "```", ``, `## Stress counts`, "```json", JSON.stringify(report.stress.counts, null, 2), "```", ``, `## Failures (${report.stress.failureCount})`, "```json", JSON.stringify(report.stress.failures, null, 2), "```"].join("\n"); }
run().catch(error => { console.error(error.stack || error); process.exit(1); });
