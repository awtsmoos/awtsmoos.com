// B"H
const http = require("http");

async function main() {
  const targets = JSON.parse(await get("http://127.0.0.1:9222/json/list"));
  const target = targets.find(item => item.url.includes("/scripts/awtsmoos/MerkavaExecutor/index.html"));
  if (!target) throw new Error("Merkava target not found");
  const cdp = await connect(target.webSocketDebuggerUrl);
  const errors = [];
  cdp.on("Runtime.exceptionThrown", event => errors.push(event.params.exceptionDetails));
  cdp.on("Log.entryAdded", event => errors.push(event.params.entry));
  cdp.on("Console.messageAdded", event => errors.push(event.params.message));
  await cdp.send("Runtime.enable");
  await cdp.send("Log.enable");
  await cdp.send("Page.enable");
  await cdp.send("Page.navigate", { url: "http://127.0.0.1:7345/scripts/awtsmoos/MerkavaExecutor/index.html?cdp=" + Date.now() });
  await sleep(4000);
  const state = await cdp.send("Runtime.evaluate", {
    expression: `(() => ({
      ready: document.readyState,
      title: document.title,
      status: document.getElementById('status') && document.getElementById('status').textContent,
      hasRenderer: !!document.getElementById('rendererSelect'),
      metrics: document.getElementById('metrics') && document.getElementById('metrics').innerText,
      appText: document.getElementById('app') && document.getElementById('app').innerText.slice(0, 300)
    }))()`,
    returnByValue: true,
    awaitPromise: true
  });
  console.log(JSON.stringify({ target: target.id, state: state.result.result.value, errors: errors.map(slim) }, null, 2));
  cdp.close();
}

function slim(item) {
  if (!item) return item;
  return {
    text: item.text || item.description || item.exception && item.exception.description || "",
    url: item.url || item.exception && item.exception.className || "",
    line: item.lineNumber,
    column: item.columnNumber,
    level: item.level
  };
}

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    let id = 0;
    const pending = new Map();
    const listeners = new Map();
    ws.onopen = () => resolve({ send, on, close: () => ws.close() });
    ws.onerror = error => reject(error);
    ws.onmessage = event => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const p = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) p.reject(new Error(JSON.stringify(msg.error)));
        else p.resolve(msg);
      } else if (msg.method && listeners.has(msg.method)) listeners.get(msg.method).forEach(fn => fn(msg));
    };
    function send(method, params) {
      const call = { id: ++id, method, params: params || {} };
      ws.send(JSON.stringify(call));
      return new Promise((resolve, reject) => pending.set(call.id, { resolve, reject }));
    }
    function on(method, fn) {
      if (!listeners.has(method)) listeners.set(method, []);
      listeners.get(method).push(fn);
    }
  });
}
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
main().catch(error => { console.error(error && error.stack || error); process.exit(1); });
