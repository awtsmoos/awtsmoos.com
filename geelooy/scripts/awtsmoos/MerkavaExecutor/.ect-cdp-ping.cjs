// B"H
const http = require("http");
setTimeout(() => { console.error("ping timeout"); process.exit(1); }, 6000);
(async () => {
  const targets = JSON.parse(await get("http://127.0.0.1:9222/json/list"));
  const target = targets.find(item => item.url.includes("newtab=1")) || targets.find(item => item.url.includes("MerkavaExecutor"));
  console.log("target", target && target.id, target && target.url);
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  ws.onopen = () => ws.send(JSON.stringify({ id: 1, method: "Runtime.evaluate", params: { expression: "1+1", returnByValue: true } }));
  ws.onerror = error => { console.error("ws error", error.message || error); process.exit(1); };
  ws.onmessage = event => { console.log(event.data); ws.close(); process.exit(0); };
})();
function get(url) { return new Promise((resolve, reject) => http.get(url, res => { let d=""; res.on("data", c => d += c); res.on("end", () => resolve(d)); }).on("error", reject)); }
