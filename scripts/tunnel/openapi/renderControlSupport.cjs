// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Renders shared preview, response, and security sections for compact OpenAPI.
 * @description
 * The Awtsmoos lets repeated structure live in one vessel rather than crowd every path;
 * Awtsmoos.com keeps schema, OAuth, and preview testimony modular, readable, and whole.
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
		"    OAuth2:",
		"      type: oauth2",
		"      flows:",
		"        authorizationCode:",
		"          authorizationUrl: https://awtsmoos.com/api/oauth/start",
		"          tokenUrl: https://awtsmoos.com/api/oauth/token",
		"          scopes:",
		"            profile: Basic identity access.",
		"            tunnel.read: Read tunnel state.",
		"            tunnel.write: Modify authorized files.",
		"            tunnel.command: Execute command diagnostics.",
		"            tunnel.browser: Browser automation.",
		"            tunnel.mission: Coordinate mission lifecycle.",
		"            tunnel.room: Read and publish shared-room messages.",
		"            tunnel.admin: Administrative tunnel operations."
	];
}

module.exports = {
	components,
	previewPath,
	responseLines
};
