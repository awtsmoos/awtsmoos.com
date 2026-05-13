
// B"H

/**
 * B"H
 * OAuth approval screen.
 * The user is logged in; now consent becomes the next gate.
 *
 * @param {object} opts Page options.
 * @param {object} opts.client OAuth client.
 * @param {string} opts.userId User id.
 * @param {string} opts.scope Scope string.
 * @param {string} opts.approveUrl Approval URL.
 * @returns {string} HTML.
 */
function approvalPage(opts) {
  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Approve Awtsmoos OAuth</title>
  <style>
    body{font-family:system-ui,sans-serif;max-width:760px;margin:40px auto;padding:24px;line-height:1.5}
    .box{border:1px solid #ddd;border-radius:16px;padding:24px}
    a{color:white;background:#111;padding:12px 16px;border-radius:10px;text-decoration:none;display:inline-block}
    code{background:#f4f4f4;border-radius:6px;padding:2px 5px}
  </style>
</head>
<body>
  <div class="box">
    <h1>B"H Allow Access?</h1>
    <p><b>${opts.client.name}</b> wants OAuth access to your Awtsmoos account.</p>
    <p>User: <code>${opts.userId}</code></p>
    <p>Scopes: <code>${opts.scope}</code></p>
    <a href="${opts.approveUrl}">Allow</a>
  </div>
</body>
</html>
`;
}

module.exports = { approvalPage };
