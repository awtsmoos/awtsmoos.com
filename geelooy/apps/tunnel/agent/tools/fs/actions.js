// B"H
const { loadConfig } = require("../../lib/config.js");
const { buildConfigActions, publicConfig } = require("./actionGroups/configActions.js");
const { buildReadActions } = require("./actionGroups/readActions.js");
const { buildProjectActions } = require("./actionGroups/projectActions.js");
const { buildWriteActions } = require("./actionGroups/writeActions.js");
const { buildFileOpsActions } = require("./actionGroups/fileOpsActions.js");
const { buildHttpActions } = require("./actionGroups/httpActionsGroup.js");
const { buildCommandActions } = require("./actionGroups/commandActions.js");
const { buildStaticServerActions } = require("./actionGroups/staticServerActions.js");
const { buildIsolatedActions } = require("./actionGroups/isolatedActions.js");
const { buildWorkflowActions } = require("./actionGroups/workflowActions.js");
const { buildPreviewActions } = require("./actionGroups/previewActions.js");
const { buildRuntimeActions } = require("./actionGroups/runtimeActions.js");
const { buildCognitionActions } = require("./actionGroups/cognitionActions.js");
const { buildQualityActions } = require("./actionGroups/qualityActions.js");
const { buildBatchAliasActions } = require("./actionGroups/batchAliasActions.js");
const { buildActionHistoryActions } = require("./actionGroups/actionHistoryActions.js");
const { buildMissionActions } = require("./actionGroups/missionActions.js");
const { buildChromeActions } = require("./actionGroups/chromeActions.js");
const { buildRemoteDesktopActions } = require("./actionGroups/remoteDesktopActions.js");

const AGENT_VERSION = "split-agent-1.5.0";

function payloadEcho(payload) {
  return { BH: "B\"H", ok: true, action: "payloadEcho", payload };
}

function actionSchemaTrace(payload) {
  return {
    BH: "B\"H", ok: true, action: "actionSchemaTrace",
    requestedAction: payload.action, adapterAction: payload.adapterAction || null,
    actionRecoveredFromCarrier: !!payload.actionRecoveredFromCarrier,
    kind: payload.kind, keys: Object.keys(payload).sort()
  };
}

/**
 * B"H — Chapter 1006: The hidden ledger entered the action palace.
 * The Awtsmoos did not demand a new backend river; it revealed the one already
 * carved in `.awtsmoos/actions`, so Room OS can replay real deeds, not shadows.
 */
function buildActions(config, payload, ws) {
  const ctx = { config, payload, ws, version: AGENT_VERSION };
  const actions = {
    ...buildConfigActions(ctx), ...buildReadActions(ctx), ...buildProjectActions(ctx),
    ...buildFileOpsActions(ctx), ...buildHttpActions(ctx), ...buildCommandActions(ctx),
    ...buildStaticServerActions(ctx), ...buildIsolatedActions(ctx),
    ...buildWriteActions(ctx), ...buildWorkflowActions(ctx, buildActions),
    ...buildPreviewActions(ctx), ...buildRuntimeActions(ctx),
    ...buildCognitionActions(ctx), ...buildQualityActions(ctx, buildActions),
    ...buildBatchAliasActions(ctx, buildActions), ...buildActionHistoryActions(ctx, buildActions),
    ...buildMissionActions(ctx), ...buildChromeActions(ctx), ...buildRemoteDesktopActions(ctx),
    payloadEcho: async () => payloadEcho(payload),
    actionSchemaTrace: async () => actionSchemaTrace(payload)
  };
  if (actions.commandRun && !actions.command) actions.command = actions.commandRun;
  if (actions.commandStart && !actions.commandRun) actions.commandRun = actions.commandStart;
  if (actions.commandStart && !actions.command) actions.command = actions.commandStart;
  return actions;
}

async function handleFsAction(payload, ws) {
  const config = loadConfig();
  const action = payload.action;
  if (!action) return { ok: false, status: 400, error: "missing_action" };
  const actions = buildActions(config, payload, ws);
  const fn = actions[action];
  if (!fn) {
    return { ok: false, status: 400, action, error: "Unknown fs action: " + action, availableActions: Object.keys(actions).sort() };
  }
  const result = await fn();
  if (!result || typeof result !== "object") return { ok: false, status: 502, action, error: "empty_action_response" };
  if (!result.action) result.action = action;
  return result;
}

function publicConfigWithVersion(config) {
  return publicConfig(config, AGENT_VERSION);
}

module.exports = { handleFsAction, publicConfig: publicConfigWithVersion, buildActions, AGENT_VERSION };
