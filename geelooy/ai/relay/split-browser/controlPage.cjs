//B"H

/**
 * Chapter 14: The Control Page Became A Map Of Doors.
 *
 * The Awtsmoos does not leave the user guessing. This page shows each living
 * route: health, session, Node-rendered ChatGPT, debug Chrome login, cookie save,
 * debug queue creation, and automation status. Secrets stay hidden; only redacted
 * summaries and command ledgers are displayed.
 *
 * @param {{port:number,targetOrigin:string}} config Runtime configuration.
 * @returns {string} Complete HTML control surface.
 */
function renderControlPage(config) {
  const control = `http://127.0.0.1:${config.port}`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Awtsmoos Split Browser Relay</title>${style()}</head><body><main class="shell">
<section class="card hero"><p class="eyebrow">B&quot;H Awtsmoos Split Browser</p><h1>Node relay control</h1>
<p class="sub">Target: <code>${escapeHtml(config.targetOrigin)}</code></p><div class="badges"><span id="healthBadge" class="status-badge idle">health unknown</span><span id="sessionBadge" class="status-badge idle">session unknown</span><span id="chromeBadge" class="status-badge idle">debug chrome unknown</span></div>
<div class="grid"><a class="button" data-open-chatgpt href="/chatgpt">Open ChatGPT through Node</a><button data-action="health">Check health</button><button data-action="session">Check session</button><button data-action="debugChromeOpen">Open debug Chrome login</button><button data-action="debugChromeSave">Save debug Chrome cookies</button><button data-action="debugSession">Create debug queue session</button><button data-action="automationStatus">Automation status</button><button data-action="clientState">Client state</button></div>
<p class="hint">Debug Chrome uses Chrome DevTools only after this explicit click. Node-rendered ChatGPT keeps popup/login traffic inside localhost proxy routes.</p><pre id="status">${escapeHtml(control)}</pre></section></main>
<div id="loader" hidden><div class="loader-card"><div class="ring"></div><strong>Loading ChatGPT through Node…</strong><span>Finish login there, then return and check session.</span></div></div><script>${script()}</script></body></html>`;
}

function style() {
  return `<style>*{box-sizing:border-box}html,body{max-width:100%;overflow-x:hidden}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:#080b12;color:#eef3ff}.shell{min-height:100vh;display:grid;place-items:center;padding:14px}.card{width:min(820px,100%);background:#111827;border:1px solid #263247;border-radius:18px;padding:18px;box-shadow:0 16px 48px #0007}.eyebrow{letter-spacing:.12em;text-transform:uppercase;color:#9db7ff;font-size:11px;margin:0 0 8px}h1{font-size:clamp(24px,6vw,34px);line-height:1.05;margin:0 0 10px}.sub,.hint{color:#cbd7ee;margin:0 0 14px;overflow-wrap:anywhere}.hint{font-size:13px}.sub code{font-size:.9em;color:#dbe7ff}.badges{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 14px}.status-badge{border-radius:999px;padding:6px 10px;font-size:12px;font-weight:800;border:1px solid #33415c;background:#172033;color:#cbd7ee}.status-badge.ok{background:#12351f;color:#b9ffd0;border-color:#2f7d4d}.status-badge.warn{background:#3b2b11;color:#ffe4a6;border-color:#8a681d}.status-badge.bad{background:#3a1720;color:#ffc4d0;border-color:#8a3148}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px;margin:14px 0}.button,button{border:0;border-radius:12px;padding:10px 12px;background:#dbe7ff;color:#07111f;font-weight:800;text-decoration:none;cursor:pointer;min-height:42px;text-align:center}pre{max-height:46vh;overflow:auto;white-space:pre-wrap;word-break:break-word;background:#05070b;border-radius:14px;padding:12px;color:#b7ffc7;font-size:12px}#loader{position:fixed;inset:0;display:grid;place-items:center;background:#05070bd9;backdrop-filter:blur(8px);z-index:99;padding:16px}#loader[hidden]{display:none}.loader-card{max-width:360px;display:grid;gap:10px;justify-items:center;text-align:center;background:#111827;border:1px solid #35425c;border-radius:18px;padding:22px;box-shadow:0 20px 60px #000a}.loader-card span{color:#9fb1d6}.ring{width:36px;height:36px;border-radius:999px;border:4px solid #2d3a55;border-top-color:#dbe7ff;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:520px){.shell{place-items:start}.grid{grid-template-columns:1fr}}</style>`;
}

function script() {
  return `const out=document.getElementById('status'),hb=document.getElementById('healthBadge'),sb=document.getElementById('sessionBadge'),cb=document.getElementById('chromeBadge');const paths={health:'/health',session:'/session-status',debugChromeOpen:'/debug-chrome/open',debugChromeSave:'/debug-chrome/save-cookies',debugSession:'/debug/session',automationStatus:'/automation-status',clientState:'/client-state'};function badge(el,text,kind){el.textContent=text;el.className='status-badge '+kind}function sessionKind(s){return s==='logged_in'?'ok':s==='not_logged_in'?'warn':'bad'}async function show(path){out.textContent='loading '+path+' ...';const r=await fetch(path,{cache:'no-store'});const j=await r.json();out.textContent=JSON.stringify(j,null,2);if(path==='/health'){badge(hb,j.ok?'health ok':'health failed',j.ok?'ok':'bad');badge(sb,j.session?.status||'session unknown',sessionKind(j.session?.status));badge(cb,j.debugChrome?.status||'debug chrome unknown',j.debugChrome?.ok?'ok':'warn')}if(path==='/session-status')badge(sb,j.status||'session failed',sessionKind(j.status));if(path.startsWith('/debug-chrome/'))badge(cb,j.status||'debug chrome checked',j.ok?'ok':'bad');return j}document.querySelectorAll('[data-action]').forEach(btn=>btn.onclick=()=>show(paths[btn.dataset.action]).catch(e=>out.textContent=e.stack||e.message));document.querySelector('[data-open-chatgpt]').addEventListener('click',event=>{event.preventDefault();document.getElementById('loader').hidden=false;setTimeout(()=>{location.href='/chatgpt'},80)});show('/health').catch(()=>{});`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

module.exports = { renderControlPage };
