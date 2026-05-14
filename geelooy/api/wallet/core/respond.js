
// B"H

function json($i, data, status = 200) {
  try {
    $i.response.statusCode = status;
    $i.response.setHeader("Content-Type", "application/json; charset=utf-8");
    $i.response.setHeader("Cache-Control", "no-store");
  } catch (e) {}

  return JSON.stringify(data, null, 2);
}

module.exports = { json };
