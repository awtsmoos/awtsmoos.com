
// B"H

/**
 * B"H
 * Login-required page.
 * It sends the user to your existing /login page, then asks them to return.
 *
 * @param {object} opts Page options.
 * @param {string} opts.clientName OAuth client name.
 * @param {string} opts.loginUrl Existing login URL.
 * @param {string} opts.continueUrl OAuth URL to retry after login.
 * @returns {string} HTML.
 */
function loginPage(opts) {
  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Awtsmoos Login Required</title>
  <style>
    body{font-family:system-ui,sans-serif;max-width:760px;margin:40px auto;padding:24px;line-height:1.5}
    .box{border:1px solid #ddd;border-radius:16px;padding:24px}
    a{color:white;background:#111;padding:12px 16px;border-radius:10px;text-decoration:none;display:inline-block;margin:8px 8px 8px 0}
    code{background:#f4f4f4;border-radius:6px;padding:2px 5px}
  </style>
</head>
<body>
  <div class="box">
    <h1>B"H Login Required</h1>
    <p>${opts.clientName} wants to connect to your Awtsmoos account.</p>
    <p>First log in using the normal Awtsmoos login screen.</p>
    <a href="${opts.loginUrl}">Open Awtsmoos Login</a>
    <a href="${opts.continueUrl}">I logged in, continue OAuth</a>
    <p>If the first button opens login successfully, sign in there, then return and press continue.</p>
    <p>Continue URL:</p>
    <code>${opts.continueUrl}</code>
  </div>
</body>
</html>
`;
}

module.exports = { loginPage };
