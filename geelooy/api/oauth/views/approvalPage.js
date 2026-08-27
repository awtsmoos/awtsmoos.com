
// B"H

/**
 * B"H
 * OAuth approval screen.
 *
 * Uses an anchor instead of a form so all OAuth query params survive.
 *
 * @param {object} opts Page options.
 * @param {object} opts.client OAuth client.
 * @param {string} opts.userId User id.
 * @param {string} opts.scope Scope string.
 * @param {string} opts.approveUrl Full approval URL.
 * @returns {string} HTML approval page.
 */
function approvalPage(opts) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Approve Awtsmoos OAuth</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    :root {
      --bg:#050712;
      --panel:rgba(255,255,255,.08);
      --line:rgba(255,255,255,.15);
      --text:#fbfcff;
      --muted:#c3cae0;
      --a:#89d7ff;
      --b:#d3a1ff;
    }
    * { box-sizing:border-box; }
    body {
      margin:0;
      min-height:100vh;
      display:grid;
      place-items:center;
      color:var(--text);
      font-family:Inter,system-ui,sans-serif;
      background:
        radial-gradient(circle at 10% 0, rgba(137,215,255,.24), transparent 34%),
        radial-gradient(circle at 90% 0, rgba(211,161,255,.20), transparent 34%),
        linear-gradient(135deg,#050712,#10172d,#171127);
    }
    main {
      width:min(760px, calc(100vw - 28px));
      border:1px solid var(--line);
      border-radius:30px;
      padding:34px;
      background:var(--panel);
      box-shadow:0 32px 110px rgba(0,0,0,.45);
      backdrop-filter:blur(16px);
    }
    h1 {
      margin:0 0 14px;
      font-size:clamp(38px,7vw,68px);
      line-height:.92;
      letter-spacing:-.065em;
    }
    p { color:var(--muted); line-height:1.55; }
    code {
      color:var(--a);
      word-break:break-all;
    }
    a.button {
      display:inline-block;
      margin-top:16px;
      padding:14px 20px;
      border-radius:999px;
      background:linear-gradient(135deg,var(--a),var(--b));
      color:#07101d;
      text-decoration:none;
      font-weight:950;
    }
    .fallback {
      margin-top:18px;
      padding:14px;
      border:1px solid var(--line);
      border-radius:18px;
      background:rgba(0,0,0,.22);
    }
    .eyebrow {
      color:var(--a);
      text-transform:uppercase;
      letter-spacing:.15em;
      font-size:12px;
      font-weight:950;
    }
  </style>
</head>
<body>
  <main>
    <p class="eyebrow">B"H • Awtsmoos OAuth</p>
    <h1>Allow Access?</h1>
    <p><strong>${opts.client.name}</strong> wants OAuth access to your Awtsmoos account.</p>
    <p>User: <code>${opts.userId}</code></p>
    <p>Scopes: <code>${opts.scope}</code></p>
    <a class="button" href="${opts.approveUrl}">Allow</a>
    <div class="fallback">
      <p>If the button does nothing, copy this URL:</p>
      <code>${opts.approveUrl}</code>
    </div>
  </main>
</body>
</html>`;
}

module.exports = { approvalPage };
