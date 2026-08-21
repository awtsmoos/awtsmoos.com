// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders the compact tunnel control parameter covenant without action-name bloat.
 * @description
 * The Awtsmoos lets fourteen public doors carry many precise values in ordered vessels;
 * Awtsmoos.com keeps `operation` explicit while ordinary payload fields remain discoverable.
 */
const STRING_NAMES = `
	operation p path cwd root content content64 find find64 replace replace64
	query query64 command command64 text text64 goal goal64 params params64
	actions actions64 actionsJson actionsJson64 writes writes64 files files64
	paths paths64 tree tree64 vars vars64 url conversationUrl chatgptUrl
	sessionId chatgptSessionId conversationId selector targetVessel vessel fallback
	routeReference treeId outputId jobId taskId actionId processKey receiptId
	workerId stream controlRequestId originalControlRequestId clientRequestId
	requestedAction requestAction resumeToken continuationPrompt continuationPrompt64
	multipleChoiceAnswer choice answer missionId websiteMissionId parentWebsiteMissionId
	parentMissionId projectRoot logicalAgentId agentSessionId agentId parentAgentId
	agentName claimId delegationId requestKey spawnRequestKey provider providerId model
	apiKey apiKey64 message message64 prompt prompt64 childPrompt system system64
	profile role scope kind evidence reportId next findings references reason
`.trim().split(/\s+/);

const INTEGER_DEFAULTS = Object.freeze({
	offsetChars: 0,
	offsetBytes: 0,
	maxInlineChars: 12000,
	pageChars: 12000,
	maxChars: 12000,
	maxBytes: 24000,
	totalMaxChars: 24000,
	maxFiles: 5,
	depth: 2,
	limit: 150,
	timeoutMs: 240000,
	waitTimeoutMs: 25000,
	budgetPerutas: 0,
	ttlSeconds: 3600,
	page: 1,
	pageSize: 50,
	port: 9222,
	pollIntervalMs: 7000,
	leaseMs: 3600000,
	maxTurns: 40,
	batchTurns: 1,
	keepTurns: 24,
	keepTabs: 1,
	settleMs: 2500
});

const BOOLEAN_DEFAULTS = Object.freeze({
	allowWrite: undefined,
	allowCommands: undefined,
	allowSecrets: undefined,
	enableLocalHttpProxy: undefined,
	regex: false,
	replaceAll: true,
	dryRun: true,
	confirm: false,
	optional: false,
	continueOnError: false,
	asyncCommand: false,
	background: false,
	inlineOutput: true,
	guidanceDebug: false,
	debugGuidance: false,
	blockOnUserMessage: true,
	allowContinue: false,
	optimizeDom: true,
	closeOldTabs: false,
	complete: false
});

function render() {
	return [
		...STRING_NAMES.map(name => parameter(name, "string", undefined, name === "operation")),
		...Object.entries(INTEGER_DEFAULTS).map(([name, value]) => parameter(name, "integer", value)),
		...Object.entries(BOOLEAN_DEFAULTS).map(([name, value]) => parameter(name, "boolean", value))
	];
}

function parameter(name, type, defaultValue, required = false) {
	const requiredText = required ? ", required: true" : "";
	const defaultText = defaultValue === undefined
		? ""
		: `, default: ${JSON.stringify(defaultValue)}`;
	return `        - { name: ${name}, in: query${requiredText}, schema: { type: ${type}${defaultText} } }`;
}

module.exports = {
	BOOLEAN_DEFAULTS,
	INTEGER_DEFAULTS,
	STRING_NAMES,
	parameter,
	render
};
