// B"H
const { loadConfig } = require("../../lib/config.js");
const { buildConfigActions, publicConfig } = require("./actionGroups/configActions.js");
const { buildReadActions } = require("./actionGroups/readActions.js");
const { buildProjectActions } = require("./actionGroups/projectActions.js");
const { buildWriteActions } = require("./actionGroups/writeActions.js");
const { buildFileOpsActions } = require("./actionGroups/fileOpsActions.js");
const { buildHttpActions } = require("./actionGroups/httpActionsGroup.js");
const { buildStaticServerActions } = require("./actionGroups/staticServerActions.js");
const { buildIsolatedActions } = require("./actionGroups/isolatedActions.js");
const { buildWorkflowActions } = require("./actionGroups/workflowActions.js");
const { buildPreviewActions } = require("./actionGroups/previewActions.js");
const { buildRuntimeActions } = require("./actionGroups/runtimeActions.js");
const { buildCognitionActions } = require("./actionGroups/cognitionActions.js");
const { buildQualityActions } = require("./actionGroups/qualityActions.js");
const { buildCommandPresetActions } = require("./actionGroups/commandPresetActions.js");
const { buildAiTemplateActions } = require("./actionGroups/aiTemplateActions.js");

const AGENT_VERSION = "split-agent-1.5.0";

/**
 * B"H
 * Builds the filesystem/data action map each request so config is always fresh.
 *
 * @param {object} config Current config.
 * @param {object} payload Incoming payload.
 * @param {object} ws Tunnel websocket.
 * @returns {object} Action map.
 */
function buildActions(config, payload, ws) {
  const ctx = { config, payload, ws, version: AGENT_VERSION };

  return {
    ...buildConfigActions(ctx),
    ...buildReadActions(ctx),
    ...buildProjectActions(ctx),
    ...buildFileOpsActions(ctx),
    ...buildHttpActions(ctx),
    ...buildStaticServerActions(ctx),
    ...buildIsolatedActions(ctx),
    ...buildWriteActions(ctx),
    ...buildWorkflowActions(ctx, buildActions),
    ...buildCommandPresetActions(ctx, buildActions),
    ...buildAiTemplateActions(ctx, buildActions),
    ...buildPreviewActions(ctx),
    ...buildRuntimeActions(ctx),
    ...buildCognitionActions(ctx),
    ...buildQualityActions(ctx, buildActions)
  };
}

async function handleFsAction(payload, ws) {
  const config = loadConfig();
  const action = payload.action || "list";
  const actions = buildActions(config, payload, ws);

  if (!actions[action]) {
    return { ok: false, status: 400, error: "Unknown fs action: " + action, availableActions: Object.keys(actions) };
  }

  return await actions[action]();
}

function publicConfigWithVersion(config) {
  return publicConfig(config, AGENT_VERSION);
}

module.exports = {
  handleFsAction,
  publicConfig: publicConfigWithVersion,
  AGENT_VERSION
};
