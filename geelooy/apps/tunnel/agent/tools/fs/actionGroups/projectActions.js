// B"H
const { jsonValidate, jsonFormat } = require("../jsonTools.js");
const { packageInfo, projectOverview } = require("../projectInfo.js");
const { dependencyGraph } = require("../dependencyGraph.js");
const { recentFiles, largeFiles, duplicateBasenames, textStats } = require("../diagnostics.js");
const { routeAudit, agentSelfTest } = require("../selfAudit.js");

function buildProjectActions(ctx) {
  const { config, payload } = ctx;

  return {
    async jsonValidate() { return await jsonValidate(config, payload); },
    async jsonFormat() { return await jsonFormat(config, payload); },
    async packageInfo() { return await packageInfo(config, payload); },
    async projectOverview() { return await projectOverview(config, payload); },
    async dependencyGraph() { return await dependencyGraph(config, payload); },
    async recentFiles() { return await recentFiles(config, payload); },
    async largeFiles() { return await largeFiles(config, payload); },
    async duplicateBasenames() { return await duplicateBasenames(config, payload); },
    async textStats() { return await textStats(config, payload); },
    async routeAudit() { return await routeAudit(config, payload); },
    async agentSelfTest() { return await agentSelfTest(config, payload); }
  };
}

module.exports = { buildProjectActions };
