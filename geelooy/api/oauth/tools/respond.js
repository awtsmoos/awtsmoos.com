
// B"H

function esc(x) {
  return String(x ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, "&quot;");
}

function json($i, obj, status = 200) {
  return {
    statusCode: status,
    mimeType: "application/json; charset=utf-8",
    headers: { "Cache-Control": "no-store" },
    response: JSON.stringify(obj, null, 2)
  };
}

function html($i, body, status = 200) {
  return {
    statusCode: status,
    mimeType: "text/html; charset=utf-8",
    headers: { "Cache-Control": "no-store" },
    response: String(body)
  };
}

function redirect($i, to) {
  return {
    statusCode: 302,
    mimeType: "text/html; charset=utf-8",
    headers: { Location: String(to), "Cache-Control": "no-store" },
    response: redirectPage(to)
  };
}

function browserRedirect($i, to) {
  return {
    statusCode: 200,
    mimeType: "text/html; charset=utf-8",
    headers: { "Cache-Control": "no-store" },
    response: redirectPage(to)
  };
}

function redirectPage(to) {
  const safe = esc(to);
  const js = JSON.stringify(to);
  return `<!doctype html>
<html>
<head>
  <title>Returning to ChatGPT</title>
  <meta http-equiv="refresh" content="0; url=${safe}">
  <script>location.replace(${js});</script>
</head>
<body>
  <h1>B"H Returning...</h1>
  <p>The OAuth code was created. Your browser should continue automatically.</p>
  <p><a href="${safe}">Continue</a></p>
  <pre>${safe}</pre>
</body>
</html>`;
}

module.exports = { json, html, redirect, browserRedirect };
