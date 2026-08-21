//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module OpenApiKeyFsAction
 * @description
 * The Awtsmoos names each available deed before parameters give it bounded form;
 * Awtsmoos.com keeps action discovery explicit so agents need not guess through transport storm.
 */

const ACTIONS = Object.freeze([
	"list", "tree", "read", "md", "bulk", "write", "bulkWrite",
	"commandRun", "commandStart", "commandStatus", "commandWait",
	"commandJobOutputPage", "retryAction", "asyncTaskStatus", "asyncTaskWait",
	"asyncTaskOutputPage", "asyncTaskCancel", "actionHistoryGet", "nodeScriptRun",
	"chromeFind", "chromeLaunch", "chromeStatus", "chromeNavigate",
	"chromeWaitForSelector", "chromeClick", "chromeType", "chromeEval",
	"chromeRunScript", "restartPreview", "semanticDiff", "detectConceptClusters",
	"simulateFailure", "generateRepairPlan", "superviseRuntime", "inferArchitecture",
	"detectAbstractionLeaks", "runtimeEntityGraph", "semanticRefactor",
	"inspectRenderStorms", "runtimeContractRegistry", "semanticSearchRuntime",
	"previewBranchMatrix", "inferBusinessRules", "stateTimeMachine",
	"detectDeadConcepts", "semanticMerge", "runtimeIntrospectionStream",
	"architectureScore", "intentDriftDetector", "semanticPackageGenerator",
	"selfHealPreview", "generateTestUniverse", "inspectHumanConfusion",
	"orchestrationGraph", "environmentVirtualizer", "runtimeSnapshot",
	"semanticCache", "goalCompiler", "autonomousBackgroundAgents",
	"semanticPipeline", "universalAppManifest", "stopPreview", "previewLogs",
	"listPreviews", "launchPreview", "inspectRuntime"
]);

function fsAction() {
	const actionItems = ACTIONS.map(action => `              - ${action}`).join("\n");
	return `  /api/tunnel/control/fs/{tunnelName}:
    get:
      operationId: awtsmoosTunnelActionWithApiKey
      summary: Run an Awtsmoos tunnel action using a user-provided API key.
      security: []
      parameters:
        - name: tunnelName
          in: path
          required: true
          schema:
            type: string
          description: User's tunnel name from the control panel.
        - name: apiKey
          in: query
          required: true
          schema:
            type: string
          description: User's Awtsmoos API key beginning with ak_.
        - name: action
          in: query
          required: true
          schema:
            type: string
            enum:
${actionItems}
`;
}

module.exports = { ACTIONS, fsAction };
