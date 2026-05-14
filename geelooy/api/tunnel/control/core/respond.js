
// B"H

function json($i, obj, status = 200) {
  $i.response.statusCode = status;
  $i.response.setHeader("Content-Type", "application/json; charset=utf-8");
  $i.response.setHeader("Cache-Control", "no-store");

  return {
    mimeType: "application/json",
    response: JSON.stringify(obj, null, 2)
  };
}

module.exports = { json };
