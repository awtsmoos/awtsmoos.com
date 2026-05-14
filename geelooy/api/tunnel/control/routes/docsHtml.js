
// B"H

const { html } = require("../core/respond.js");
const { apiCatalog } = require("../docs/catalog.js");

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "<")
    .replaceAll(">", ">")
    .replaceAll('"', "&quot;");
}

function endpointCard(ep) {
  return `
    <article class="doc-card">
      <div class="doc-card-head">
        <span class="method">${esc(ep.method)}</span>
        <strong>${esc(ep.id)}</strong>
      </div>
      <code>${esc(ep.path)}</code>
      <p>${esc(ep.description)}</p>
      <small>Auth: ${esc(ep.auth)}</small>
    </article>
  `;
}

function actionRow(action) {
  return `
    <tr>
      <td><code>${esc(action.action)}</code></td>
      <td>${esc(action.scope)}</td>
      <td>${esc((action.params || []).join(", "))}</td>
    </tr>
  `;
}

async function docsHtml($i) {
  const body = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Awtsmoos Tunnel API Docs</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    :root {
      --bg:#070913;--panel:rgba(255,255,255,.08);--line:rgba(255,255,255,.16);
      --text:#f7f8ff;--muted:#b9c0d7;--a:#8bd3ff;--b:#d7a7ff;
    }
    *{box-sizing:border-box}
    body{margin:0;background:radial-gradient(circle at 10% 0,rgba(139,211,255,.25),transparent 35%),linear-gradient(135deg,#070913,#121a2e,#181326);color:var(--text);font-family:Inter,system-ui,sans-serif}
    main{width:min(1200px,calc(100vw - 26px));margin:auto;padding:32px 0 80px}
    .hero{border:1px solid var(--line);border-radius:32px;padding:38px;background:var(--panel);box-shadow:0 30px 110px rgba(0,0,0,.4)}
    h1{font-size:clamp(42px,8vw,86px);line-height:.92;letter-spacing:-.07em;margin:0}
    p{color:var(--muted);line-height:1.6}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;margin-top:22px}
    .doc-card{border:1px solid var(--line);border-radius:22px;padding:18px;background:rgba(0,0,0,.22)}
    .doc-card-head{display:flex;align-items:center;gap:10px;margin-bottom:10px}
    .method{background:linear-gradient(135deg,var(--a),var(--b));color:#07101e;font-weight:900;border-radius:999px;padding:6px 10px}
    code,pre{font-family:ui-monospace,Consolas,monospace}
    code{display:block;word-break:break-all;color:var(--a);margin:8px 0}
    table{width:100%;border-collapse:collapse;margin-top:18px;overflow:hidden;border-radius:20px}
    td,th{border:1px solid var(--line);padding:12px;text-align:left}
    th{color:var(--a);background:rgba(255,255,255,.06)}
    a{color:var(--a);font-weight:900}
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <p style="color:var(--a);font-weight:900;letter-spacing:.14em;text-transform:uppercase">B"H • API Documentation</p>
      <h1>Awtsmoos Tunnel Control API</h1>
      <p>Human docs for dashboard, Custom GPT Actions, and any other AI or program using API keys or OAuth.</p>
      <p><a href="/api/tunnel/control/docs.json">Machine-readable JSON docs</a> • <a href="/api/tunnel/control/openapi">OpenAPI YAML</a> • <a href="/apps/tunnel-control/">Hosted Control Panel</a></p>
    </section>

    <h2>Endpoints</h2>
    <section class="grid">
      ${apiCatalog.endpoints.map(endpointCard).join("")}
    </section>

    <h2>Tunnel actions</h2>
    <table>
      <thead><tr><th>Action</th><th>Scope</th><th>Params</th></tr></thead>
      <tbody>${apiCatalog.actions.map(actionRow).join("")}</tbody>
    </table>
  </main>
</body>
</html>`;

  return html($i, body);
}

module.exports = { docsHtml };
