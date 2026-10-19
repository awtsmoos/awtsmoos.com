// B"H
// Boruch Hashem
// Blessed is He

const ActionPath = require("./renderActionPath.cjs");
const Guidance = require("./guidance.cjs");
const Support = require("./renderControlSupport.cjs");
const Transfer = require("./renderTransferGet.cjs");

/**
 * @file Renders the compact Awtsmoos Tunnel OpenAPI document.
 * @description
 * The Awtsmoos keeps ordinary deeds small and gives great intent a body rather than an endless URI;
 * Awtsmoos.com preserves the legacy GET doorway while the primary action covenant travels as JSON.
 */
function render(actions = []) {
	return [
		...header(),
		...bootstrapPath(),
		...devicePath(),
		...hostedSafePath(),
		...simpleSecurePaths(),
		...ActionPath.render(actions),
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
		"  version: 9.0.0-body-first",
		`  description: ${JSON.stringify(Guidance.RESPONSE_RULE)}`,
		"servers:",
		"  - url: https://awtsmoos.com",
		"paths:"
	];
}

function bootstrapPath() {
	return simpleGet("/api/tunnel/control/bootstrap", "awtsmoosBootstrap", "Get setup instructions.", "[]");
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

function hostedSafePath() {
	return [
		"  /api/tunnel/control/fs/awtsmoos-os:",
		"    get:",
		"      operationId: awtsmoosHostedSafeAction",
		"      summary: Run a hosted Virtual OS read-only command or bounded public HTTP GET.",
		"      description: Hosted commands run only against account-owned VFS; HTTP GET pins public DNS and blocks internal targets and unsafe redirects.",
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

function simpleSecurePaths() {
	return [
		"  /api/tunnel/control/simple/cmd:",
		"    get:",
		"      operationId: awtsmoosSimpleEnqueue",
		"      summary: Enqueue a limited native command with a private client header or expiring signed URL.",
		"      description: GET-only clients must use expires, nonce and HMAC sig; agent ID is required and commands are policy-gated on the agent.",
		"      security: [{ SimpleClientKey: [] }, { SimpleSignedUrl: [] }]",
		"      parameters:",
		"        - { name: agentId, in: query, required: true, schema: { type: string } }",
		"        - { name: command, in: query, required: true, schema: { type: string, maxLength: 4096 } }",
		"        - { name: expires, in: query, schema: { type: integer } }",
		"        - { name: nonce, in: query, schema: { type: string } }",
		"        - { name: sig, in: query, schema: { type: string } }",
		...Support.responseLines(),
		"  /api/tunnel/control/simple/result:",
		"    get:",
		"      operationId: awtsmoosSimpleResult",
		"      summary: Poll and consume a simple command's authenticated output.",
		"      security: [{ SimpleClientKey: [] }, { SimpleSignedUrl: [] }]",
		"      parameters:",
		"        - { name: id, in: query, required: true, schema: { type: string } }",
		"        - { name: expires, in: query, schema: { type: integer } }",
		"        - { name: nonce, in: query, schema: { type: string } }",
		"        - { name: sig, in: query, schema: { type: string } }",
		...Support.responseLines(),
		"  /api/tunnel/control/simple/status:",
		"    get:",
		"      operationId: awtsmoosSimpleStatus",
		"      summary: Read authenticated aggregate queue counters, not command content.",
		"      security: [{ SimpleClientKey: [] }, { SimpleSignedUrl: [] }]",
		"      responses:",
		"        '200': { description: Authorized queue status or structured denial }"
	];
}

module.exports = { render };
