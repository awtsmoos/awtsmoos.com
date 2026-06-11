// B"H
const http = require("http");
const fs = require("fs");
const OUT = ".ect-cdp-page-test-result.json";
setTimeout(() => fail(new Error("CDP page test timeout")), 18000);

async function main() {
  const target = await freshTarget();
  const cdp = await connect(target.webSocketDebuggerUrl);
  const events = [];
  cdp.on("Runtime.exceptionThrown", e => events.push({ kind: "exception", data: e.params.exceptionDetails }));
  cdp.on("Log.entryAdded", e => events.push({ kind: "log", data: e.params.entry }));
  cdp.on("Runtime.consoleAPICalled", e => events.push({ kind: "console", data: e.params }));
  await cdp.send("Runtime.enable");
  await cdp.send("Log.enable");
  await cdp.send("Page.enable");
  await cdp.send("Page.navigate", { url: "http://127.0.0.1:7345/scripts/awtsmoos/MerkavaExecutor/index.html?cdp=" + Date.now() });
  await sleep(4500);
  const state = await evalJson(cdp, `(() => {
    const iframe = document.getElementById('preview');
    const doc = iframe && iframe.contentDocument;
    return {
      ready: document.readyState,
      status: document.getElementById('status')?.textContent || '',
      hasRenderer: !!document.getElementById('rendererSelect'),
      metrics: document.getElementById('metrics')?.innerText || '',
      appText: document.getElementById('app')?.innerText.slice(0, 400) || '',
      iframeText: doc?.body?.innerText.slice(0, 400) || '',
      iframeHtml: doc?.body?.innerHTML.slice(0, 400) || '',
      scripts: Array.from(document.scripts).map(s => s.src)
    };
  })()`);
  fs.writeFileSync(OUT, JSON.stringify({ target: target.id, state, events: events.map(slimEvent) }, null, 2));
  console.log(OUT);
  cdp.close();
}

async function freshTarget() {
  const made = JSON.parse(await request("PUT", "http://127.0.0.1:9222/json/new?about:blank"));
  return made;
}

async function evalJson(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", { expression: "JSON.stringify(" + expression + ")", returnByValue: true, awaitPromise: true });
  return JSON.parse(result.result.result.value);
}

function slimEvent(event) {
  const d = event.data || {};
  return {
    kind: event.kind,
    text: d.text || d.description || d.exception && d.exception.description || (d.args && d.args.map(a => a.value || a.description).join(" ")) || "",
    url: d.url || "",
    line: d.lineNumber,
    column: d.columnNumber,
    level: d.level
  };
}

function request(method, url) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method }, res => { let d = ""; res.on("data", c => d += c); res.on("end", () => resolve(d)); });
    req.on("error", reject);
    req.end();
  });
}
function connect(url) { return new Promise((resolve, reject) => { const ws = new WebSocket(url); let id = 0; const pending = new Map(), listeners = new Map(); ws.onopen = () => resolve({ send, on, close: () => ws.close() }); ws.onerror = reject; ws.onmessage = event => { const msg = JSON.parse(event.data); if (msg.id && pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg); } else if (msg.method && listeners.has(msg.method)) listeners.get(msg.method).forEach(fn => fn(msg)); }; function send(method, params) { const call = { id: ++id, method, params: params || {} }; ws.send(JSON.stringify(call)); return new Promise((resolve, reject) => pending.set(call.id, { resolve, reject })); } function on(method, fn) { if (!listeners.has(method)) listeners.set(method, []); listeners.get(method).push(fn); } }); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function fail(error) { fs.writeFileSync(OUT, JSON.stringify({ error: String(error && error.stack || error) }, null, 2)); console.error(error.message); process.exit(1); }
main().catch(fail);
