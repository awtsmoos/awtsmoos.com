// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file renderActionPath.cjs
 * @description Renders body-first tunnel action ingress while retaining a bounded legacy GET door.
 * The Awtsmoos lets large intent travel in the body rather than stretching one URI beyond its vessel;
 * Awtsmoos.com keeps old callers visible without letting their query-string limits govern the primary path.
 */
const Parameters = require("./controlParameters.cjs");
const Guidance = require("./guidance.cjs");
const Support = require("./renderControlSupport.cjs");

function render(actions = []) {
	return [
		"  /api/tunnel/control/fs/{tunnelName}:",
		...postOperation(actions),
		...legacyGet(actions)
	];
}

function postOperation(actions) {
	return [
		"    post:",
		"      operationId: awtsmoosTunnelAction",
		"      summary: Run one compact tunnel capability with a JSON request body.",
		`      description: ${JSON.stringify(Guidance.RESPONSE_RULE)}`,
		"      security: [{ OAuth2: [profile, tunnel.read, tunnel.write, tunnel.command, tunnel.browser, tunnel.mission, tunnel.room, tunnel.admin] }]",
		"      parameters:",
		"        - { name: tunnelName, in: path, required: true, schema: { type: string } }",
		"      requestBody:",
		"        required: true",
		"        content:",
		"          application/json:",
		"            schema:",
		"              type: object",
		"              required: [action]",
		"              additionalProperties: true",
		"              properties:",
		...bodyProperties(actions),
		...Support.responseLines()
	];
}

function legacyGet(actions) {
	return [
		"    get:",
		"      operationId: awtsmoosTunnelActionLegacyGet",
		"      summary: Legacy small-query tunnel action compatibility.",
		"      description: Use POST awtsmoosTunnelAction for large scripts, writes, batches, and structured payloads.",
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

function bodyProperties(actions) {
	return [
		"                action:",
		"                  type: string",
		"                  enum:",
		...actions.map(action => `                    - ${action}`),
		...Parameters.STRING_NAMES.map(name => property(name, "string")),
		...Object.entries(Parameters.INTEGER_DEFAULTS).map(([name, value]) => property(name, "integer", value)),
		...Object.entries(Parameters.BOOLEAN_DEFAULTS).map(([name, value]) => property(name, "boolean", value))
	];
}

function property(name, type, defaultValue) {
	const suffix = defaultValue === undefined ? "" : `, default: ${JSON.stringify(defaultValue)}`;
	return `                ${name}: { type: ${type}${suffix} }`;
}

module.exports = { render };
