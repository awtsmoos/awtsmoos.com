
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
    headers: {
      "Cache-Control": "no-store"
    },
    response: JSON.stringify(obj, null, 2)
  };
}

function html($i, body, status = 200) {
  return {
    statusCode: status,
    mimeType: "text/html; charset=utf-8",
    headers: {
      "Cache-Control": "no-store"
    },
    response: String(body)
  };
}

function redirect($i, to) {
  return {
    statusCode: 302,
    mimeType: "text/html; charset=utf-8",
    headers: {
      Location: String(to),
      "Cache-Control": "no-store"
    },
    response: redirectPage(to)
  };
}

function browserRedirect($i, to) {
  return {
    statusCode: 200,
    mimeType: "text/html; charset=utf-8",
    headers: {
      "Cache-Control": "no-store"
    },
    response: redirectPage(to)
  };
}

function redirectPage(to) {
  const safe = esc(to);
  const js = JSON.stringify(to);

  return "<!doctype html>" +
    "<html><head><meta charset='utf-8'>" +
    "<title>Returning to ChatGPT</title>" +
    "<meta name='viewport' content='width=device-width, initial-scale=1'>" +
    "<meta http-equiv='refresh' content='0;url=" + safe + "'>" +
    "<style>" +
    "body{margin:0;min-height:100vh;display:grid;place-items:center;background:radial-gradient(circle at 10% 0,rgba(137,215,255,.24),transparent 34%),linear-gradient(135deg,#050712,#10172d,#171127);color:#fbfcff;font-family:system-ui}" +
    "main{width:min(760px,calc(100vw - 28px));border:1px solid rgba(255,255,255,.15);border-radius:30px;padding:34px;background:rgba(255,255,255,.08);box-shadow:0 32px 110px rgba(0,0,0,.45);backdrop-filter:blur(16px)}" +
    "h1{font-size:clamp(38px,7vw,68px);line-height:.92;letter-spacing:-.06em;margin:0 0 14px}" +
    "p{color:#c3cae0;line-height:1.55}code{color:#89d7ff;word-break:break-all}" +
    "a.button{display:inline-block;margin-top:16px;padding:14px 20px;border-radius:999px;background:linear-gradient(135deg,#89d7ff,#d3a1ff);color:#07101d;text-decoration:none;font-weight:950}" +
    "</style>" +
    "<script>setTimeout(function(){window.location.replace(" + js + ");},50);</script>" +
    "</head><body><main>" +
    "<h1>B&quot;H Returning...</h1>" +
    "<p>The OAuth code was created. Your browser should continue automatically.</p>" +
    "<a class='button' href='" + safe + "'>Continue</a>" +
    "<p><code>" + safe + "</code></p>" +
    "</main></body></html>";
}

module.exports = {
  json,
  html,
  redirect,
  browserRedirect
};
