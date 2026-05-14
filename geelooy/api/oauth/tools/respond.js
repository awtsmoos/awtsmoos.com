
// B"H

function json($i, obj, status = 200) {
  try {
    $i.response.statusCode = status;
    $i.response.setHeader("Content-Type", "application/json; charset=utf-8");
    $i.response.setHeader("Cache-Control", "no-store");
  } catch (e) {}

  return {
    mimeType: "application/json; charset=utf-8",
    response: JSON.stringify(obj, null, 2)
  };
}

function html($i, body, status = 200) {
  try {
    $i.response.statusCode = status;
    $i.response.setHeader("Content-Type", "text/html; charset=utf-8");
    $i.response.setHeader("Cache-Control", "no-store");
  } catch (e) {}

  return {
    mimeType: "text/html; charset=utf-8",
    response: String(body)
  };
}

function redirect($i, to) {
  try {
    $i.response.statusCode = 302;
    $i.response.setHeader("Location", to);
    $i.response.setHeader("Cache-Control", "no-store");
  } catch (e) {}

  return {
    mimeType: "text/plain; charset=utf-8",
    response: "Redirecting to " + to
  };
}

module.exports = { json, html, redirect };
