//B"H
// Boruch Hashem
// Blessed is He

"use strict";

const { OAUTH_SCOPE_DESCRIPTIONS } = require("../../../geelooy/api/tunnel/shared/scopeCatalog.js");

/**
 * @file Renders transport-independent OpenAPI support contracts.
 * @description Scope descriptions come from the one runtime OAuth catalog;
 * adding application authority must never leave a stale public consent map.
 */
function previewPath() {
	return [
		"  /api/tunnel/control/preview/{tunnelName}:",
		"    get:",
		"      operationId: awtsmoosPreviewProxy",
		"      summary: Fetch preview through tunnel.",
		"      security: [{ OAuth2: [profile, tunnel.read] }]",
		"      parameters:",
		"        - { name: tunnelName, in: path, required: true, schema: { type: string } }",
		"        - { name: url, in: query, schema: { type: string } }",
		"        - { name: maxChars, in: query, schema: { type: integer, default: 500000 } }",
		"      responses:",
		"        \"200\": { description: Preview response body }"
	];
}

function responseLines() {
	return [
		"      responses:",
		"        \"200\": { description: OK, content: { application/json: { schema: { $ref: \"#/components/schemas/AnyResponse\" } } } }"
	];
}

/**
 * Emit the complete consent catalog and avoid duplicating scope declarations.
 * Use JSON string literals for valid, escaped YAML scalar descriptions.
 */
function oauthScopeLines() {
	return Object.entries(OAUTH_SCOPE_DESCRIPTIONS).map(
		([scope, description]) => `            ${scope}: ${JSON.stringify(description)}`
	);
}

function components() {
	return [
		"components:",
		"  schemas:",
		"    AnyResponse:",
		"      type: object",
		"      additionalProperties: true",
		"      properties:",
		"        ok: { type: boolean }",
		"        error: { type: string }",
		"        action: { type: string }",
		"        responseFocus: { type: object, additionalProperties: true }",
		"  securitySchemes:",
		"    SimpleClientKey:",
		"      type: apiKey",
		"      in: header",
		"      name: x-awtsmoos-simple-client-key",
		"      description: Separate configured high-entropy client credential, never in URL.",
		"    SimpleSignedUrl:",
		"      type: apiKey",
		"      in: query",
		"      name: sig",
		"      description: HMAC signature also binds purpose, agent ID, command hash or result ID, five-minute expiry and nonce.",
		"    OAuth2:",
		"      type: oauth2",
		"      flows:",
		"        authorizationCode:",
		"          authorizationUrl: https://awtsmoos.com/api/oauth/authorize",
		"          tokenUrl: https://awtsmoos.com/api/oauth/token",
		"          scopes:",
		...oauthScopeLines()
	];
}

module.exports = {
	components,
	oauthScopeLines,
	previewPath,
	responseLines
};
