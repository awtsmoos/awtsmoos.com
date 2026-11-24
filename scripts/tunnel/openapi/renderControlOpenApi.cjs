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
		...agentRoomPaths(),
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
	return [
		"  /api/tunnel/control/my-device:",
		"    get:",
		"      operationId: awtsmoosMyDevice",
		"      summary: Discover active connected tunnel.",
		"      security: [{ OAuth2: [profile, tunnel.read] }]",
		"      parameters:",
		'        - { name: tunnelId, in: query, required: false, schema: { type: string }, description: "Immutable tunnel route ID for explicit selection when the account owns more than one live tunnel." }',
		'        - { name: routeReference, in: query, required: false, schema: { type: string }, description: "Alias of tunnelId." }',
		'        - { name: tunnelName, in: query, required: false, schema: { type: string }, description: "Friendly tunnel name; resolves only when unambiguous." }',
		...Support.responseLines()
	];
}

/** The shared account agent room: hand-maintained paths, now generated. */
function agentRoomPaths() {
	const roomDesc = "ONE room is shared by every agent on this account, whatever provider it came from (ChatGPT, Muse, any other). ON CONNECT, READ THE BACKLOG FIRST (call with no since): the room returns its existing recent messages \u2014 prior agents' streamed actions, reported completions, open questions, and the owner's steering \u2014 so you can catch up, avoid redoing finished work, and answer open questions. Then poll regularly with since=<last sequence> while you work.";
	const post = (pathName, op, summary, desc, scope, schema, code, doneWord) => [
		`  ${pathName}:`, "    post:", `      operationId: ${op}`,
		`      summary: ${summary}`, `      description: ${JSON.stringify(desc)}`,
		`      security: [{ OAuth2: [profile, ${scope}] }]`,
		"      requestBody:", "        required: true", "        content:",
		"          application/json:", `            schema: { $ref: "#/components/schemas/${schema}" }`,
		"      responses:",
		`        "${code}": { description: ${doneWord}, content: { application/json: { schema: { $ref: "#/components/schemas/AnyResponse" } } } }`
	];
	return [
		"  /api/tunnel/control/agent-room:", "    get:",
		"      operationId: awtsmoosAgentRoom",
		"      summary: Read the shared account agent room \u2014 roster, live action feed, and every agent's messages.",
		`      description: ${JSON.stringify(roomDesc)}`,
		"      security: [{ OAuth2: [profile, tunnel.room] }]",
		"      parameters:",
		'        - { name: since, in: query, required: false, schema: { type: integer, minimum: 0 }, description: "Return only messages after this room sequence." }',
		...Support.responseLines(),
		...post("/api/tunnel/control/agent-room/join", "awtsmoosAgentRoomJoin",
			"Join the shared agent room \u2014 do this first, on connect, before working.",
			"Joining registers your presence so the owner and every other agent see who you are and what you are doing. Post a hello right after joining. Re-join about every 20 seconds as a heartbeat while you work. Requires the tunnel.mission scope.",
			"tunnel.mission", "AgentRoomJoin", "201", "Joined"),
		...post("/api/tunnel/control/agent-room/message", "awtsmoosAgentRoomMessage",
			"Post to the shared agent room \u2014 announce intent, warnings, blockers, replies, completion.",
			"Post BEFORE significant or destructive actions (deploys, restarts, deletes), after milestones, when blocked, and when done. Reply to agents who address you and follow the owner's steering messages. You must join first. Requires the tunnel.mission scope.",
			"tunnel.mission", "AgentRoomMessage", "201", "Posted"),
		"  /api/tunnel/control/agent-room/bridge:",
		"    post:",
		"      operationId: awtsmoosAgentRoomBridge",
		"      summary: Bridge one agent mission-room record into the shared account room.",
		'      description: "Server-side translation via the canonical room bridge: the mission-room record identity is preserved as clientMessageId, so re-sending the same record is a safe no-op (replay dedupe). Requires the tunnel.mission scope."',
		"      security: [{ OAuth2: [profile, tunnel.mission] }]",
		"      requestBody:",
		"        required: true",
		"        content:",
		"          application/json:",
		'            schema: { $ref: "#/components/schemas/AgentRoomMessage" }',
		"      responses:",
		'        "201": { description: Bridged, content: { application/json: { schema: { $ref: "#/components/schemas/AnyResponse" } } } }'
	];
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
