
// B"H

/**
 * B"H
 * Sends JSON through the Awtsmoos dynamic server response wrapper.
 *
 * @param {object} $i Awtsmoos route context.
 * @param {object} obj Response object.
 * @param {number} status HTTP status.
 * @returns {object} Dynamic response packet.
 */
function json($i, obj, status = 200) {
  $i.response.statusCode = status;
  $i.response.setHeader("Content-Type", "application/json; charset=utf-8");
  $i.response.setHeader("Cache-Control", "no-store");

  return {
    mimeType: "application/json",
    response: JSON.stringify(obj, null, 2)
  };
}

/**
 * B"H
 * Sends HTML through the dynamic server.
 *
 * @param {object} $i Awtsmoos route context.
 * @param {string} body HTML body.
 * @param {number} status HTTP status.
 * @returns {object} Dynamic response packet.
 */
function html($i, body, status = 200) {
  $i.response.statusCode = status;
  $i.response.setHeader("Content-Type", "text/html; charset=utf-8");
  $i.response.setHeader("Cache-Control", "no-store");

  return {
    mimeType: "text/html",
    response: body
  };
}

/**
 * B"H
 * Sends an HTTP redirect.
 *
 * @param {object} $i Awtsmoos route context.
 * @param {string} to Redirect target URL.
 * @returns {object} Dynamic response packet.
 */
function redirect($i, to) {
  $i.response.statusCode = 302;
  $i.response.setHeader("Location", to);
  $i.response.setHeader("Cache-Control", "no-store");

  return {
    mimeType: "text/plain",
    response: "Redirecting..."
  };
}

module.exports = { json, html, redirect };
