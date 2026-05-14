
// B"H

function setStatus($i, status) {
  try {
    $i.response.statusCode = status;
  } catch (e) {}
}

function json($i, data, status = 200) {
  setStatus($i, status);
  $i.response.setHeader("Content-Type", "application/json; charset=utf-8");
  return JSON.stringify(data, null, 2);
}

function html($i, text, status = 200) {
  setStatus($i, status);
  $i.response.setHeader("Content-Type", "text/html; charset=utf-8");
  return String(text);
}

function text($i, body, mime = "text/plain; charset=utf-8", status = 200) {
  setStatus($i, status);
  $i.response.setHeader("Content-Type", mime);
  return String(body);
}

module.exports = {
  json,
  html,
  text
};
