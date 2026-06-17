// B"H
const { treasuryCss } = require("../styles/treasuryCss.js");
function esc(x) { return String(x ?? "").replace(/[&<>\"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function shell(title, body, data = {}) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>${treasuryCss()}</style></head><body><div class="awt-shell"><aside class="awt-side"><div class="awt-brand">ב״ה<br>AWTSMOOS TREASURY</div>${nav()}</aside><main class="awt-main">${body}</main></div><script type="application/json" id="treasury-data">${esc(JSON.stringify(data))}</script></body></html>`;
}
function nav() {
  const items = ["home", "budgets", "forecast", "marketplace", "agents", "providers", "graph", "advisor", "reputation"];
  return items.map(x => `<a href="/api/tunnel/control/treasury/${x}">${x}</a>`).join("");
}
function kpi(label, value, note = "") { return `<section class="awt-card awt-kpi"><span class="awt-pill">${esc(label)}</span><br><b>${esc(value)}</b><p>${esc(note)}</p></section>`; }
function jsonBlock(value) { return `<pre class="awt-card awt-json">${esc(JSON.stringify(value, null, 2))}</pre>`; }
module.exports = { esc, jsonBlock, kpi, shell };
