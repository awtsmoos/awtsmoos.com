// B"H
// Boruch Hashem
// Blessed is He

const Parameters = require("./controlParameters.cjs");
const Guidance = require("./guidance.cjs");
const Support = require("./renderControlSupport.cjs");
const Transfer = require("./renderTransferGet.cjs");

/**
 * @file Renders the compact Awtsmoos Tunnel OpenAPI document.
 * @description
 * The Awtsmoos keeps ordinary deeds small and gives great files their own river;
 * Awtsmoos.com exposes bounded resumable GET transfer separately so giant bodies never
 * have to become generic query strings merely to reach an owned tunnel.
 */
function render(actions = []) {
	return [
		...header(),
		...bootstrapPath(),
		...devicePath(),
		...hostedSafePath(),
		...actionPath(actions),
		...Transfer.render(),
		...Support.previewPath(),
		...Support.components(),
		""
	].join("\n");
}

function header() {
	return [
		"# B\"H",
		"# Boruch Hashem",
		"# Blessed is He",
		"openapi: 3.1.0",
		"info:",
		"  title: Awtsmoos Tunnel Control GPT Actions",
		"  version: 8.1.0-compact-transfer",
		`  description: ${JSON.stringify(Guidance.RESPONSE_RULE)}`,
		"servers:",
		"  - url: https://awtsmoos.com",
		"paths:"
	];
}

function bootstrapPath() {
	return simpleGet(
		"/api/tunnel/control/bootstrap",
		"awtsmoosBootstrap",
		"Get setup instructions.",
		"[]"
	);
}

function devicePath() {
	return simpleGet(
		"/api/tunnel/control/my-device",
		"awtsmoosMyDevice",
		"Discover active connected tunnel.",
		"[{ OAuth2: [profile, tunnel.read] }]"
	);
}

function simpleGet(pathName, operationId, summary, security) {
	return [
		`  ${pathName}:`,
		"    get:",
		`      operationId: ${operationId}`,
		`      summary: ${summary}`,
		`      security: ${security}`,
		...Support.responseLines()
	];
}

/** Document the two implemented hosted execution modes without implying a native shell. */
function hostedSafePath() {
	return [
		"  /api/tunnel/control/fs/awtsmoos-os:",
		"    get:",
		"      operationId: awtsmoosHostedSafeAction",
		"      summary: Run a hosted Virtual OS read-only command or bounded public HTTP GET.",
		"      description: Hosted commands run only against account-owned VFS (not native shell); HTTP GET pins public DNS and blocks internal targets and unsafe redirects.",
		"      security: [{ OAuth2: [profile, tunnel.read] }, { OAuth2: [profile, tunnel.command] }]",
		"      parameters:",
		"        - { name: action, in: query, required: true, schema: { type: string, enum: [httpGet, commandRun] } }",
		"        - { name: url, in: query, schema: { type: string, format: uri } }",
		"        - { name: command, in: query, schema: { type: string, maxLength: 4096 } }",
		"        - { name: cwd, in: query, schema: { type: string } }",
		"        - { name: timeoutMs, in: query, schema: { type: integer, minimum: 100, maximum: 30000 } }",
		"        - { name: maxBytes, in: query, schema: { type: integer, minimum: 1, maximum: 2000000 } }",
		...Support.responseLines()
	];
}

function actionPath(actions) {
	return [
		"  /api/tunnel/control/fs/{tunnelName}:",
		"    get:",
		"      operationId: awtsmoosTunnelAction",
		"      summary: Run one compact tunnel capability and exact internal operation.",
		`      description: ${JSON.stringify(Guidance.RESPONSE_RULE)}`,
		"      security: [{ OAuth2: [profile, tunnel.read, tunnel.write, tunnel.command, tunnel.browser, tunnel.mission, tunnel.room, tunnel.admin] }]",
		"      parameters:",
		"        - { name: tunnelName, in: path, required: true, schema: { type: string } }",
		"        - name: action",
		"          in: query",
		"          required: true",
		"          schema:",
		"            type: string",
		"            enum:",
		...actions.map(action => `              - ${action}`),
		...Parameters.render(),
		...Support.responseLines()
	];
}

module.exports = { render };
