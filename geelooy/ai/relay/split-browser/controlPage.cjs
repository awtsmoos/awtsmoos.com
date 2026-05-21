//B"H

/**
 * Chapter 3: The Eye Opened On Localhost.
 *
 * The page is not ChatGPT and does not claim to be. It is the user-facing eye
 * where Node shows its state, opens the Node-rendered ChatGPT vessel, and lets
 * later WebSocket organs be added without shaking the old relay.
 *
 * @param {{port:number,targetOrigin:string}} config Runtime configuration.
 * @returns {string} Complete HTML control surface.
 */
function renderControlPage(config) {
  const control = `http://127.0.0.1:${config.port}`;
  return `<!doctype html><html><head><meta charset="utf-8">
<title>Awtsmoos Split Browser Relay</title>${style()}</head><body>
<main class="shell">
  <section class="card hero">
    <p class="eyebrow">B&quot;H Awtsmoos Split Browser</p>
    <h1>Node is the ChatGPT client. This tab is the living control window.</h1>
    <p>Open the Node-rendered ChatGPT page below. Node fetches from ${escapeHtml(config.targetOrigin)} and serves the view here for testing.</p>
    <div class="actions">
      <a class="button" data-open-chatgpt href="/">Render ChatGPT through Node</a>
      <button id="health">Check local relay</button>
    </div>
    <pre id="status">${escapeHtml(control)}</pre>
  </section>
</main>
<div id="loader" hidden><div class="loader-card"><div class="ring"></div><strong>Loading ChatGPT through Node…</strong><span>Fetching base HTML, JS bundles, CSS, and challenge files.</span></div></div>
<script>${script()}</script></body></html>`;
}

function style() {
  return `<style>body{margin:0;font-family:system-ui;background:#080b12;color:#eef3ff}.shell{min-height:100vh;display:grid;place-items:center;padding:24px}.card{max-width:840px;background:#111827;border:1px solid #263247;border-radius:24px;padding:28px;box-shadow:0 24px 80px #0008}.eyebrow{letter-spacing:.14em;text-transform:uppercase;color:#9db7ff;font-size:12px}h1{font-size:34px;line-height:1.05;margin:10px 0 16px}.actions{display:flex;gap:12px;flex-wrap:wrap;margin:22px 0}.button,button{border:0;border-radius:14px;padding:12px 16px;background:#dbe7ff;color:#07111f;font-weight:800;text-decoration:none;cursor:pointer}pre{white-space:pre-wrap;background:#05070b;border-radius:16px;padding:16px;color:#b7ffc7}#loader{position:fixed;inset:0;display:grid;place-items:center;background:#05070bd9;backdrop-filter:blur(8px);z-index:99}#loader[hidden]{display:none}.loader-card{display:grid;gap:12px;justify-items:center;background:#111827;border:1px solid #35425c;border-radius:22px;padding:28px;box-shadow:0 24px 80px #000a}.loader-card span{color:#9fb1d6}.ring{width:42px;height:42px;border-radius:999px;border:4px solid #2d3a55;border-top-color:#dbe7ff;animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}</style>`;
}

function script() {
  return `document.getElementById('health').onclick=async()=>{const r=await fetch('/health');document.getElementById('status').textContent=JSON.stringify(await r.json(),null,2)};document.querySelector('[data-open-chatgpt]').addEventListener('click',event=>{event.preventDefault();document.getElementById('loader').hidden=false;setTimeout(()=>{location.href='/'},80)});`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

module.exports = { renderControlPage };
