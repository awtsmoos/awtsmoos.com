// B"H
const http = require("http");
setTimeout(() => { console.error("current timeout"); process.exit(1); }, 8000);
(async () => {
  const targets = JSON.parse(await get("http://127.0.0.1:9222/json/list"));
  const target = targets.find(item => item.url.includes("newtab=1")) || targets.find(item => item.url.includes("cdp=")) || targets.find(item => item.url.includes("MerkavaExecutor"));
  console.log("target", target.id, target.url);
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0;
  const send = (method, params) => ws.send(JSON.stringify({ id: ++id, method, params: params || {} }));
  ws.onopen = () => send("Runtime.evaluate", { expression: "JSON.stringify({href:location.href,ready:document.readyState,title:document.title,body:document.body&&document.body.innerText.slice(0,300),hasDoc:typeof document,hasWindow:typeof window})", returnByValue: true });
  ws.onerror = e => { console.error("ws error", e.message || e); process.exit(1); };
  ws.onmessage = event => { console.log(event.data.slice(0, 4000)); ws.close(); process.exit(0); };
})();
function get(url) { return new Promise((resolve, reject) => http.get(url, res => { let d=""; res.on("data", c => d += c); res.on("end", () => resolve(d)); }).on("error", reject)); }
