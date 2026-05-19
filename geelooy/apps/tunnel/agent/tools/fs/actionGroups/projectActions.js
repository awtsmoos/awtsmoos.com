// B"H
const { jsonValidate, jsonFormat } = require("../jsonTools.js");
const { packageInfo, projectOverview } = require("../projectInfo.js");
const { dependencyGraph } = require("../dependencyGraph.js");
const { recentFiles, largeFiles, duplicateBasenames, textStats } = require("../diagnostics.js");
const { routeAudit, agentSelfTest } = require("../selfAudit.js");
const {
  syntaxCheck,
  yamlValidate,
  openApiValidate,
  bulkDebugPayload,
  liveAgentVersionCompare
} = require("../projectValidation.js");

function buildProjectActions(ctx) {
  const { config, payload } = ctx;

  return {
    async syntaxCheck() { return await syntaxCheck(config, payload); },
    async nodeCheckFile() { return await syntaxCheck(config, { ...payload, action: "nodeCheckFile" }); },
    async yamlValidate() { return await yamlValidate(config, payload); },
    async openApiValidate() { return await openApiValidate(config, payload); },
    async bulkDebugPayload() { return await bulkDebugPayload(config, payload); },
    async liveAgentVersionCompare() { return await liveAgentVersionCompare(config, payload); },
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
