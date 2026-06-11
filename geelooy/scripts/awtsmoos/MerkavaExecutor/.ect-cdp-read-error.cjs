// B"H
const http = require("http");
setTimeout(() => { console.error("error read timeout"); process.exit(1); }, 8000);
(async () => {
  const targets = JSON.parse(await get("http://127.0.0.1:9222/json/list"));
  const target = targets.find(item => item.url.includes("newtab=1")) || targets.find(item => item.url.includes("MerkavaExecutor"));
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0;
  const expr = `JSON.stringify({
    status: document.getElementById('status')?.textContent || '',
    metricsHtml: document.getElementById('metrics')?.innerHTML || '',
    metricsText: document.getElementById('metrics')?.innerText || '',
    bytecode: document.getElementById('bytecode')?.innerText.slice(0,1000) || '',
    app: document.getElementById('app')?.innerText.slice(0,1000) || ''
  })`;
  ws.onopen = () => ws.send(JSON.stringify({ id: ++id, method: "Runtime.evaluate", params: { expression: expr, returnByValue: true } }));
  ws.onerror = e => { console.error("ws", e.message || e); process.exit(1); };
  ws.onmessage = e => { console.log(e.data); ws.close(); process.exit(0); };
})();
function get(url) { return new Promise((resolve, reject) => http.get(url, res => { let d=""; res.on("data", c => d += c); res.on("end", () => resolve(d)); }).on("error", reject)); }
