//B"H

/**
 * Chapter 3: The Eye Opened On Localhost.
 *
 * The page is not ChatGPT and does not claim to be. It is a compact relay eye:
 * health, session status, redacted token summaries, and the Node-rendered login
 * door. The Awtsmoos reveals truth through small badges rather than giant noise,
 * so mobile screens do not overflow and secrets do not escape.
 *
 * @param {{port:number,targetOrigin:string}} config Runtime configuration.
 * @returns {string} Complete HTML control surface.
 */
function renderControlPage(config) {
  const control = `http://127.0.0.1:${config.port}`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Awtsmoos Split Browser Relay</title>${style()}</head><body>
<main class="shell">
  <section class="card hero">
    <p class="eyebrow">B&quot;H Awtsmoos Split Browser</p>
    <h1>Node relay control</h1>
    <p class="sub">Target: <code>${escapeHtml(config.targetOrigin)}</code></p>
    <div class="badges"><span id="healthBadge" class="status-badge idle">health unknown</span><span id="sessionBadge" class="status-badge idle">session unknown</span></div>
    <div class="actions">
      <a class="button" data-open-chatgpt href="/">Open ChatGPT through Node</a>
      <button id="health">Check health</button>
      <button id="session-status">Check session</button>
    </div>
    <pre id="status">${escapeHtml(control)}</pre>
  </section>
</main>
<div id="loader" hidden><div class="loader-card"><div class="ring"></div><strong>Loading ChatGPT through Node…</strong><span>Finish login there, then return and check session.</span></div></div>
<script>${script()}</script></body></html>`;
}

function style() {
  return `<style>*{box-sizing:border-box}html,body{max-width:100%;overflow-x:hidden}body{margin:0;font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:#080b12;color:#eef3ff}.shell{min-height:100vh;display:grid;place-items:center;padding:14px}.card{width:min(760px,100%);background:#111827;border:1px solid #263247;border-radius:18px;padding:18px;box-shadow:0 16px 48px #0007}.eyebrow{letter-spacing:.12em;text-transform:uppercase;color:#9db7ff;font-size:11px;margin:0 0 8px}h1{font-size:clamp(24px,6vw,34px);line-height:1.05;margin:0 0 10px}.sub{color:#cbd7ee;margin:0 0 14px;overflow-wrap:anywhere}.sub code{font-size:.9em;color:#dbe7ff}.badges{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 14px}.status-badge{border-radius:999px;padding:6px 10px;font-size:12px;font-weight:800;border:1px solid #33415c;background:#172033;color:#cbd7ee}.status-badge.ok{background:#12351f;color:#b9ffd0;border-color:#2f7d4d}.status-badge.warn{background:#3b2b11;color:#ffe4a6;border-color:#8a681d}.status-badge.bad{background:#3a1720;color:#ffc4d0;border-color:#8a3148}.actions{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0}.button,button{border:0;border-radius:12px;padding:10px 12px;background:#dbe7ff;color:#07111f;font-weight:800;text-decoration:none;cursor:pointer;min-height:42px}pre{max-height:46vh;overflow:auto;white-space:pre-wrap;word-break:break-word;background:#05070b;border-radius:14px;padding:12px;color:#b7ffc7;font-size:12px}#loader{position:fixed;inset:0;display:grid;place-items:center;background:#05070bd9;backdrop-filter:blur(8px);z-index:99;padding:16px}#loader[hidden]{display:none}.loader-card{max-width:360px;display:grid;gap:10px;justify-items:center;text-align:center;background:#111827;border:1px solid #35425c;border-radius:18px;padding:22px;box-shadow:0 20px 60px #000a}.loader-card span{color:#9fb1d6}.ring{width:36px;height:36px;border-radius:999px;border:4px solid #2d3a55;border-top-color:#dbe7ff;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:520px){.shell{place-items:start}.actions>*{width:100%}}</style>`;
}

function script() {
  return `const out=document.getElementById('status');const hb=document.getElementById('healthBadge');const sb=document.getElementById('sessionBadge');function badge(el,text,kind){el.textContent=text;el.className='status-badge '+kind}async function show(path){const r=await fetch(path,{cache:'no-store'});const j=await r.json();out.textContent=JSON.stringify(j,null,2);return j}document.getElementById('health').onclick=async()=>{try{const j=await show('/health');badge(hb,j.ok?'health ok':'health failed',j.ok?'ok':'bad');badge(sb,j.session?.status||'session unknown',j.session?.status==='logged_in'?'ok':j.session?.status==='not_logged_in'?'warn':'bad')}catch(e){badge(hb,'health failed','bad');out.textContent=e.message}};document.getElementById('session-status').onclick=async()=>{try{const j=await show('/session-status');badge(sb,j.status||'session failed',j.status==='logged_in'?'ok':j.status==='not_logged_in'?'warn':'bad')}catch(e){badge(sb,'session failed','bad');out.textContent=e.message}};document.querySelector('[data-open-chatgpt]').addEventListener('click',event=>{event.preventDefault();document.getElementById('loader').hidden=false;setTimeout(()=>{location.href='/'},80)});`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

module.exports = { renderControlPage };
