// B"H
function esc(x) { return String(x ?? "").replace(/[&<>\"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function fmt(n) { return Number(n || 0).toLocaleString(); }
function shell(title, body, data) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>${css()}</style></head><body><div class="bg"></div><main>${body}</main><script type="application/json" id="data">${esc(JSON.stringify(data || {}))}</script></body></html>`;
}
function css() { return `:root{color-scheme:dark;--g:#73ffd5;--p:#8b5cff;--c:#dffdf6}*{box-sizing:border-box}body{margin:0;background:#05050c;color:var(--c);font-family:Inter,system-ui,Segoe UI,sans-serif}.bg{position:fixed;inset:0;background:radial-gradient(circle at 10% 10%,#204 0 20%,#0000 35%),radial-gradient(circle at 90% 0,#064 0 15%,#0000 35%),linear-gradient(135deg,#060712,#03040a);z-index:-1}main{max-width:1180px;margin:auto;padding:42px 18px}.hero{display:grid;gap:22px;grid-template-columns:1.3fr .7fr}.card,.plan{border:1px solid #ffffff22;background:linear-gradient(160deg,#ffffff12,#ffffff06);box-shadow:0 20px 80px #0008;border-radius:28px;padding:24px;backdrop-filter:blur(18px)}h1{font-size:clamp(38px,8vw,86px);line-height:.88;margin:0;background:linear-gradient(90deg,var(--g),#fff,var(--p));-webkit-background-clip:text;color:transparent}.sub{font-size:19px;color:#b7c9d6;max-width:760px}.grid,.plans{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px;margin-top:22px}.metric{padding:18px;border-radius:22px;background:#0008;border:1px solid #ffffff16}.metric b{font-size:30px;color:#fff}.pill{display:inline-block;padding:8px 12px;border-radius:999px;background:#73ffd522;color:#9fffe2;border:1px solid #73ffd555}.price{font-size:30px;color:#fff}.small{color:#aeb8c8;font-size:13px}.btn{display:inline-block;margin:8px 8px 0 0;padding:12px 16px;border-radius:14px;background:linear-gradient(90deg,var(--g),var(--p));color:#061014;text-decoration:none;font-weight:800}.list{display:grid;gap:10px;margin-top:14px}.row{display:flex;justify-content:space-between;gap:12px;padding:11px 0;border-bottom:1px solid #ffffff14}.warn{color:#ffd591}@media(max-width:800px){.hero{grid-template-columns:1fr}}`; }
function balanceCards(summary = {}) {
  summary = summary || {};
  const b = summary.balances || {};
  return ["routing", "compute", "storage", "gpu"].map(k => `<div class="metric"><span>${k}</span><br><b>${fmt(b[k])}</b><div class="small">daily refresh by tier</div></div>`).join("");
}
function planCards(plans = {}) {
  return Object.values(plans).map(p => `<section class="plan"><span class="pill">${esc(p.letter || p.code)}</span><h3>${esc(p.name)}</h3><div class="price">$${esc(p.priceUsd || 0)}</div><div class="small">routing/day ${fmt(p.daily?.routing)}<br>compute/day ${fmt(p.daily?.compute)}<br>cap ${fmt(p.caps?.routing)} routing</div></section>`).join("");
}
function recentRows(items = []) {
  return (items || []).slice(0, 12).map(x => `<div class="row"><span>${esc(x.action || x.kind)}</span><span>${esc(x.category || "")}</span><span>${fmt(x.bytes || x.measuredPerutas || 0)}</span></div>`).join("") || `<div class="small">No recent activity yet.</div>`;
}
module.exports = { balanceCards, esc, fmt, planCards, recentRows, shell };
