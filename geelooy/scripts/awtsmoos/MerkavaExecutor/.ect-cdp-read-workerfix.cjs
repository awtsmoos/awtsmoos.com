// B"H
const http = require("http");
setTimeout(() => { console.error("workerfix read timeout"); process.exit(1); }, 12000);
(async () => {
  const targets = JSON.parse(await get("http://127.0.0.1:9222/json/list"));
  const target = targets.find(item => item.url.includes("workerfix=1"));
  if (!target) throw new Error("workerfix tab not found");
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0;
  const expr = `JSON.stringify({
    href: location.href,
    ready: document.readyState,
    status: document.getElementById('status')?.textContent || '',
    metricsText: document.getElementById('metrics')?.innerText || '',
    bytecode: document.getElementById('bytecode')?.innerText.slice(0,800) || '',
    hasRenderer: !!document.getElementById('rendererSelect')
  })`;
  ws.onopen = () => setTimeout(() => ws.send(JSON.stringify({ id: ++id, method: "Runtime.evaluate", params: { expression: expr, returnByValue: true } })), 5000);
  ws.onerror = e => { console.error("ws", e.message || e); process.exit(1); };
  ws.onmessage = e => { console.log(e.data); ws.close(); process.exit(0); };
})();
function get(url) { return new Promise((resolve, reject) => http.get(url, res => { let d=""; res.on("data", c => d += c); res.on("end", () => resolve(d)); }).on("error", reject)); }
