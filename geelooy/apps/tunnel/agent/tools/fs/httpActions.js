// B"H
const {
  listJars,
  listCookies,
  setCookie,
  deleteCookie,
  clearJar
} = require("./httpCookieJar.js");

const { httpRequest, httpJson, httpDownload } = require("./httpClient.js");

/**
 * B"H
 * Routes native Node HTTP/session actions through a small data map.
 *
 * @param {object} config Agent config.
 * @param {object} payload Request payload.
 * @returns {Promise<object>} Action result.
 */
async function handleHttpAction(config, payload = {}) {
  const actions = {
    httpRequest: () => httpRequest(config, payload),
    httpJson: () => httpJson(config, payload),
    httpDownload: () => httpDownload(config, payload),
    httpCookieJarList: () => listJars(),
    httpCookies: () => listCookies(payload),
    httpCookieSet: () => setCookie(payload),
    httpCookieDelete: () => deleteCookie(payload),
    httpSessionClear: () => clearJar(payload)
  };

  const fn = actions[payload.action];

  if (!fn) {
    return {
      ok: false,
      action: payload.action,
      error: "unknown_http_action",
      availableActions: Object.keys(actions)
    };
  }

  return await fn();
}

module.exports = { handleHttpAction };
