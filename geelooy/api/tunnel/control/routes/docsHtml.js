
// B"H
const { apiCatalog } = require("../docs/catalog.js");

function esc(x) {
  return String(x ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "<")
    .replace(/>/g, ">");
}

function actionCard(action) {
  return `
    <article class="action-card">
      <div>
        <strong>${esc(action.action)}</strong>
        <span>${esc(action.scope)}</span>
      </div>
      <p>${esc(action.summary || "")}</p>
      <code>${esc((action.params || []).join(", ") || "no params")}</code>
    </article>
  `;
}

async function docsHtml($i) {
  try {
    $i.response.setHeader("Content-Type", "text/html; charset=utf-8");
    $i.response.setHeader("Cache-Control", "no-store");
  } catch (e) {}

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Awtsmoos Tunnel API Docs</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    :root {
      --bg:#050712;
      --panel:rgba(255,255,255,.075);
      --panel2:rgba(255,255,255,.12);
      --line:rgba(255,255,255,.15);
      --a:#89d7ff;
      --b:#d3a1ff;
      --c:#86ffc5;
      --text:#fbfcff;
      --muted:#c3cae0;
      --bad:#ff9797;
      --warn:#ffe08d;
    }
    * { box-sizing:border-box; }
    html { scroll-behavior:smooth; }
    body {
      margin:0;
      color:var(--text);
      font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;
      background:
        radial-gradient(circle at 8% -10%, rgba(137,215,255,.26), transparent 34%),
        radial-gradient(circle at 92% 0%, rgba(211,161,255,.22), transparent 34%),
        linear-gradient(135deg,#050712,#10172d 52%,#171127);
    }
    main {
      width:min(1220px, calc(100vw - 28px));
      margin:auto;
      padding:28px 0 80px;
    }
    .hero, .card {
      border:1px solid var(--line);
      border-radius:30px;
      background:
        radial-gradient(circle at top right, rgba(137,215,255,.12), transparent 42%),
        rgba(255,255,255,.075);
      box-shadow:0 30px 120px rgba(0,0,0,.44), inset 0 1px 0 rgba(255,255,255,.08);
      backdrop-filter:blur(16px);
    }
    .hero {
      padding:clamp(26px,6vw,58px);
      margin-bottom:18px;
    }
    h1 {
      margin:0;
      font-size:clamp(44px,8vw,88px);
      line-height:.9;
      letter-spacing:-.075em;
    }
    h2 { margin:0 0 14px; letter-spacing:-.04em; }
    p, li { color:var(--muted); line-height:1.65; }
    a { color:var(--a); font-weight:900; }
    code, pre {
      border:1px solid var(--line);
      border-radius:14px;
      background:#070b16;
      color:#eef3ff;
      padding:.2em .45em;
    }
    pre {
      display:block;
      padding:16px;
      white-space:pre-wrap;
      overflow:auto;
    }
    .eyebrow {
      color:var(--a);
      text-transform:uppercase;
      letter-spacing:.16em;
      font-weight:1000;
      font-size:12px;
    }
    .nav {
      display:flex;
      flex-wrap:wrap;
      gap:10px;
      position:sticky;
      top:10px;
      z-index:5;
      padding:10px;
      margin-bottom:18px;
      border:1px solid var(--line);
      border-radius:24px;
      background:rgba(5,8,19,.82);
      backdrop-filter:blur(18px);
    }
    .nav a {
      text-decoration:none;
      border:1px solid var(--line);
      border-radius:999px;
      padding:10px 14px;
      background:rgba(255,255,255,.07);
    }
    .card { padding:22px; margin-bottom:18px; }
    .grid {
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(260px,1fr));
      gap:14px;
    }
    .action-card {
      border:1px solid var(--line);
      border-radius:22px;
      padding:16px;
      background:rgba(0,0,0,.2);
    }
    .action-card strong {
      display:block;
      font-size:20px;
    }
    .action-card span {
      color:var(--c);
      font-weight:900;
      font-size:12px;
    }
    .callout {
      border:1px solid rgba(137,215,255,.45);
      border-radius:22px;
      padding:16px;
      background:rgba(137,215,255,.08);
      margin:16px 0;
    }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <p class="eyebrow">B"H • Awtsmoos Tunnel Control</p>
      <h1>Human API Docs</h1>
      <p>Use this API to connect a GPT, AI agent, or tool to a user's local Awtsmoos Tunnel agent. The user controls the root folder, API key scopes, writes, terminal access, and Chrome access.</p>
      <div class="callout">
        <strong>Public GPT flow:</strong>
        <p>Do not hardcode a tunnel name. Ask the user to open <a href="/apps/tunnel-control/">/apps/tunnel-control/</a>, run the installer, then paste their <code>tunnelName</code>.</p>
      </div>
    </section>

    <nav class="nav">
      <a href="#setup">Setup</a>
      <a href="#auth">Auth</a>
      <a href="#actions">Actions</a>
      <a href="#examples">Examples</a>
      <a href="/api/tunnel/control/docs.json">JSON Docs</a>
      <a href="/api/tunnel/control/openapi">OpenAPI</a>
      <a href="/apps/tunnel-control/privacy.html">Privacy</a>
    </nav>

    <section class="card" id="setup">
      <p class="eyebrow">Setup</p>
      <h2>First-use setup</h2>
      <ol>
        <li>Open <a href="/apps/tunnel-control/">https://awtsmoos.com/apps/tunnel-control/</a>.</li>
        <li>Run the installer command.</li>
        <li>The hosted panel opens with <code>?tunnelName=awt-...</code>.</li>
        <li>Copy that tunnel name into the GPT chat.</li>
      </ol>
      <pre>irm https://awtsmoos.com/api/tunnel/install/windows | iex</pre>
      <pre>curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash</pre>
    </section>

    <section class="card" id="auth">
      <p class="eyebrow">Auth</p>
      <h2>Authentication</h2>
      <p>GPT Actions should use OAuth. Non-GPT tools may use <code>x-awtsmoos-api-key</code>.</p>
      <pre>Authorization URL: https://awtsmoos.com/api/oauth/authorize
Token URL: https://awtsmoos.com/api/oauth/token
Scopes: profile tunnel.read tunnel.write tunnel.command tunnel.browser</pre>
    </section>

    <section class="card" id="actions">
      <p class="eyebrow">Actions</p>
      <h2>Available tunnel actions</h2>
      <div class="grid">
        ${apiCatalog.actions.map(actionCard).join("\\n")}
      </div>
    </section>

    <section class="card" id="examples">
      <p class="eyebrow">Examples</p>
      <h2>Common calls</h2>
      <pre>GET /api/tunnel/control/fs/{tunnelName}?action=list&amp;p=.</pre>
      <pre>GET /api/tunnel/control/fs/{tunnelName}?action=tree&amp;p=.&amp;depth=2&amp;limit=150</pre>
      <pre>GET /api/tunnel/control/fs/{tunnelName}?action=read&amp;p=package.json</pre>
      <pre>GET /api/tunnel/control/bootstrap</pre>
    </section>
  </main>
</body>
</html>`;
}

module.exports = { docsHtml };
