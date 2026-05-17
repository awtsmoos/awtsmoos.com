// B"H
const { handleHttpAction } = require("../httpActions.js");

function buildHttpActions(ctx) {
  const { config, payload } = ctx;

  return {
    async httpRequest() { return await handleHttpAction(config, payload); },
    async httpJson() { return await handleHttpAction(config, payload); },
    async httpDownload() { return await handleHttpAction(config, payload); },
    async httpCookieJarList() { return await handleHttpAction(config, payload); },
    async httpCookies() { return await handleHttpAction(config, payload); },
    async httpCookieSet() { return await handleHttpAction(config, payload); },
    async httpCookieDelete() { return await handleHttpAction(config, payload); },
    async httpSessionClear() { return await handleHttpAction(config, payload); }
  };
}

module.exports = { buildHttpActions };
