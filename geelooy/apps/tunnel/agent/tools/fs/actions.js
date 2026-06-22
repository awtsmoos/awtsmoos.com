// B"H
const { loadConfig } = require("../../lib/config.js");
const { buildConfigActions, publicConfig } = require("./actionGroups/configActions.js");
const { buildReadActions } = require("./actionGroups/readActions.js");
const { buildProjectActions } = require("./actionGroups/projectActions.js");
const { buildWriteActions } = require("./actionGroups/writeActions.js");
const { buildImageActions } = require("./actionGroups/imageActions.js");
const { buildFileOpsActions } = require("./actionGroups/fileOpsActions.js");
const { buildHttpActions } = require("./actionGroups/httpActionsGroup.js");
const { buildStaticServerActions } = require("./actionGroups/staticServerActions.js");
const { buildIsolatedActions } = require("./actionGroups/isolatedActions.js");
const { buildWorkflowActions } = require("./actionGroups/workflowActions.js");
const { buildCommandTreeActions } = require("./actionGroups/commandTreeActions.js");
const { buildPreviewActions } = require("./actionGroups/previewActions.js");
const { buildEphemeralActions } = require("./actionGroups/ephemeralActions.js");
const { buildRenderLabActions } = require("./actionGroups/renderLabActions.js");
const { buildRuntimeActions } = require("./actionGroups/runtimeActions.js");
const { buildProcessActions } = require("./actionGroups/processActions.js");
const { buildCognitionActions } = require("./actionGroups/cognitionActions.js");
const { buildQualityActions } = require("./actionGroups/qualityActions.js");
const { buildCommandPresetActions } = require("./actionGroups/commandPresetActions.js");
const { buildAiTemplateActions } = require("./actionGroups/aiTemplateActions.js");
const { buildAiAgentActions } = require("./actionGroups/aiAgentActions.js");
const { buildActionHistoryActions } = require("./actionGroups/actionHistoryActions.js");
const { buildChromeActions } = require("./actionGroups/chromeActions.js");
const { buildCommandActions } = require("./actionGroups/commandActions.js");
const { buildMissionActions } = require("./actionGroups/missionActions.js");
const { buildChatGptActions } = require("../chatgpt/index.js");
const ledger = require("./actionLedger.js");

const AGENT_VERSION = "split-agent-1.5.0";

/**
 * B"H
 * Chapter 516: A mission layer entered without breaking the old gates.
 * It lives beside the existing action families and tells the agent to continue
 * until evidence and definition-of-done gates breathe together.
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
    ...buildImageActions(ctx),
    ...buildChromeActions(ctx),
    ...buildCommandActions(ctx),
    ...buildMissionActions(ctx),
    ...buildCognitionActions(ctx),
    ...buildCommandPresetActions(ctx, buildActions),
    ...buildAiTemplateActions(ctx, buildActions),
    ...buildAiAgentActions(ctx, buildActions),
    ...buildChatGptActions(ctx),
    ...buildActionHistoryActions(ctx, buildActions),
    ...buildPreviewActions(ctx),
    ...buildEphemeralActions(ctx),
    ...buildRenderLabActions(ctx),
    ...buildRuntimeActions(ctx),
    ...buildProcessActions(ctx),
    ...buildWorkflowActions(ctx, buildActions),
    ...buildQualityActions(ctx),
    ...buildCommandTreeActions(ctx, buildActions)
  };
}

async function handleFsAction(payload, ws) {
  const config = loadConfig();
  const action = payload.action || "list";
  const actions = buildActions(config, payload, ws);
  if (!actions[action]) return { ok: false, status: 400, error: "Unknown fs action: " + action, availableActions: Object.keys(actions) };
  const result = await actions[action]();
  return await ledger.record(config, payload, result);
}

function publicConfigWithVersion(config) { return publicConfig(config, AGENT_VERSION); }

module.exports = { handleFsAction, buildActions, publicConfig: publicConfigWithVersion, AGENT_VERSION };
