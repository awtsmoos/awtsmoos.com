// B"H
const http = require("http");
const fs = require("fs");
const OUT = ".ect-cdp-debug-result.json";
setTimeout(() => fail(new Error("CDP fast timeout")), 12000);
async function main() {
  const targets = JSON.parse(await get("http://127.0.0.1:9222/json/list"));
  const target = targets.find(item => item.url.includes("/scripts/awtsmoos/MerkavaExecutor/index.html"));
  if (!target) throw new Error("Merkava target not found");
  const cdp = await connect(target.webSocketDebuggerUrl);
  const errors = [];
  cdp.on("Runtime.exceptionThrown", event => errors.push(event.params.exceptionDetails));
  cdp.on("Log.entryAdded", event => errors.push(event.params.entry));
  await cdp.send("Runtime.enable");
  await cdp.send("Log.enable");
  await cdp.send("Runtime.evaluate", { expression: "location.href='http://127.0.0.1:7345/scripts/awtsmoos/MerkavaExecutor/index.html?fast=' + Date.now()" });
  await sleep(2500);
  const state = await cdp.send("Runtime.evaluate", { expression: "JSON.stringify({ready:document.readyState,status:document.getElementById('status')&&document.getElementById('status').textContent,hasRenderer:!!document.getElementById('rendererSelect'),app:(document.getElementById('app')&&document.getElementById('app').innerText||'').slice(0,200),metrics:(document.getElementById('metrics')&&document.getElementById('metrics').innerText||'').slice(0,400)})" });
  fs.writeFileSync(OUT, JSON.stringify({ state: state.result.result.value, errors: errors.map(slim) }, null, 2));
  cdp.close();
  console.log(OUT);
  process.exit(0);
}
function slim(item) { return { text: item && (item.text || item.description || item.exception && item.exception.description || ""), url: item && item.url, line: item && item.lineNumber, level: item && item.level }; }
function get(url) { return new Promise((resolve, reject) => http.get(url, res => { let d=""; res.on("data", c => d += c); res.on("end", () => resolve(d)); }).on("error", reject)); }
function connect(url) { return new Promise((resolve, reject) => { const ws = new WebSocket(url); let id = 0; const pending = new Map(), listeners = new Map(); ws.onopen = () => resolve({ send, on, close: () => ws.close() }); ws.onerror = reject; ws.onmessage = event => { const msg = JSON.parse(event.data); if (msg.id && pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg); } else if (msg.method && listeners.has(msg.method)) listeners.get(msg.method).forEach(fn => fn(msg)); }; function send(method, params) { ws.send(JSON.stringify({ id: ++id, method, params: params || {} })); return new Promise((resolve, reject) => pending.set(id, { resolve, reject })); } function on(method, fn) { if (!listeners.has(method)) listeners.set(method, []); listeners.get(method).push(fn); } }); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function fail(error) { fs.writeFileSync(OUT, JSON.stringify({ error: String(error && error.stack || error) }, null, 2)); console.error(error.message); process.exit(1); }
main().catch(fail);
