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
