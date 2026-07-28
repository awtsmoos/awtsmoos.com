// B"H
const { isolatedJsTest, isolatedNodeCheck, isolatedCleanup } = require("../isolatedJs.js");
const { isolatedHtmlTest } = require("../isolatedHtml.js");
const { nodeCheckMany } = require("../nodeCheckMany.js");

function buildIsolatedActions(ctx) {
  const { config, payload } = ctx;

  return {
    async isolatedJsTest() { return await isolatedJsTest(config, payload); },
    async isolatedNodeCheck() { return await isolatedNodeCheck(config, payload); },
    async isolatedHtmlTest() { return await isolatedHtmlTest(config, payload); },
    async isolatedCleanup() { return await isolatedCleanup(config, payload); },
    async nodeCheckMany() { return await nodeCheckMany(config, payload); },
    async nodeCheckFiles() { return await nodeCheckMany(config, payload); }
  };
}

module.exports = { buildIsolatedActions };
