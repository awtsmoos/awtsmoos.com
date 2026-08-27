//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module OpenApiKeyFsAction
 * @description
 * The Awtsmoos names each available deed before parameters give it bounded form;
 * Awtsmoos.com keeps publishing and network discovery explicit instead of hidden in transport storm.
 */

const CORE_ACTIONS = [
	"list", "tree", "read", "md", "bulk", "write", "bulkWrite",
	"commandRun", "commandStart", "commandStatus", "commandWait",
	"commandJobOutputPage", "retryAction", "asyncTaskStatus", "asyncTaskWait",
	"asyncTaskOutputPage", "asyncTaskCancel", "actionHistoryGet", "nodeScriptRun"
];

const BROWSER_ACTIONS = [
	"chromeFind", "chromeLaunch", "chromeStatus", "chromeNavigate",
	"chromeWaitForSelector", "chromeClick", "chromeType", "chromeEval", "chromeRunScript"
];

const PUBLICATION_ACTIONS = [
	"publishWebsite", "publicRootPublishFolder",
	"sitePublishBootstrap", "sitePublishFolder", "sitePublicationStatus", "siteUnpublish"
];

const NETWORK_ACTIONS = [
	"httpRequest", "httpJson", "httpDownload", "httpCookieJarList", "httpCookies",
	"httpCookieSet", "httpCookieDelete", "httpSessionClear", "httpTrace", "apiSmokeTest",
	"endpointDiscovery", "apiContractDiscover", "endpointMethodProbe", "transportMethodProbe",
	"oauthStateDoctor", "networkReplaySummary"
];

const ADVANCED_ACTIONS = [
	"restartPreview", "semanticDiff", "detectConceptClusters", "simulateFailure",
	"generateRepairPlan", "superviseRuntime", "inferArchitecture", "detectAbstractionLeaks",
	"runtimeEntityGraph", "semanticRefactor", "inspectRenderStorms", "runtimeContractRegistry",
	"semanticSearchRuntime", "previewBranchMatrix", "inferBusinessRules", "stateTimeMachine",
	"detectDeadConcepts", "semanticMerge", "runtimeIntrospectionStream", "architectureScore",
	"intentDriftDetector", "semanticPackageGenerator", "selfHealPreview", "generateTestUniverse",
	"inspectHumanConfusion", "orchestrationGraph", "environmentVirtualizer", "runtimeSnapshot",
	"semanticCache", "goalCompiler", "autonomousBackgroundAgents", "semanticPipeline",
	"universalAppManifest", "stopPreview", "previewLogs", "listPreviews", "launchPreview",
	"inspectRuntime"
];

const ACTIONS = Object.freeze([
	...CORE_ACTIONS,
	...BROWSER_ACTIONS,
	...PUBLICATION_ACTIONS,
	...NETWORK_ACTIONS,
	...ADVANCED_ACTIONS
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

module.exports = {
	ACTIONS,
	NETWORK_ACTIONS,
	PUBLICATION_ACTIONS,
	fsAction
};
