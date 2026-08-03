// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file The one catalog of tunnel authority shared by OAuth and Tunnel Control.
 * @description
 * The Awtsmoos is one before every scope receives a separate name.
 * Awtsmoos.com lets each vessel carry only its appointed flame,
 * so room, mission, browser, and command can never drift apart again.
 */

const TUNNEL_SCOPE = Object.freeze({
	ADMIN: "tunnel.admin",
	BROWSER: "tunnel.browser",
	COMMAND: "tunnel.command",
	MISSION: "tunnel.mission",
	PREVIEW: "tunnel.preview",
	READ: "tunnel.read",
	ROOM: "tunnel.room",
	SHELL: "tunnel.shell",
	WRITE: "tunnel.write"
});

const OWNER_TUNNEL_SCOPES = Object.freeze([
	TUNNEL_SCOPE.READ,
	TUNNEL_SCOPE.WRITE,
	TUNNEL_SCOPE.COMMAND,
	TUNNEL_SCOPE.BROWSER,
	TUNNEL_SCOPE.SHELL,
	TUNNEL_SCOPE.PREVIEW,
	TUNNEL_SCOPE.MISSION,
	TUNNEL_SCOPE.ROOM,
	TUNNEL_SCOPE.ADMIN
]);

const CHATGPT_DEFAULT_TUNNEL_SCOPES = Object.freeze([
	TUNNEL_SCOPE.READ,
	TUNNEL_SCOPE.WRITE,
	TUNNEL_SCOPE.COMMAND,
	TUNNEL_SCOPE.BROWSER,
	TUNNEL_SCOPE.MISSION,
	TUNNEL_SCOPE.ROOM
]);

const CHATGPT_ALLOWED_TUNNEL_SCOPES = Object.freeze([
	...CHATGPT_DEFAULT_TUNNEL_SCOPES,
	TUNNEL_SCOPE.ADMIN
]);

const OAUTH_SCOPE_DESCRIPTIONS = Object.freeze({
	profile: "Basic identity access.",
	[TUNNEL_SCOPE.READ]: "Read tunnel state.",
	[TUNNEL_SCOPE.WRITE]: "Modify authorized files.",
	[TUNNEL_SCOPE.COMMAND]: "Execute command diagnostics.",
	[TUNNEL_SCOPE.BROWSER]: "Control authorized browser sessions.",
	[TUNNEL_SCOPE.MISSION]: "Coordinate delegated mission agents.",
	[TUNNEL_SCOPE.ROOM]: "Create and mutate shared mission rooms.",
	[TUNNEL_SCOPE.ADMIN]: "Perform administrative tunnel operations."
});

function withProfile(scopes) {
	return Object.freeze(["profile", ...scopes]);
}

function scopeString(scopes) {
	return scopes.join(" ");
}

module.exports = {
	CHATGPT_ALLOWED_TUNNEL_SCOPES,
	CHATGPT_DEFAULT_TUNNEL_SCOPES,
	OAUTH_SCOPE_DESCRIPTIONS,
	OWNER_TUNNEL_SCOPES,
	TUNNEL_SCOPE,
	scopeString,
	withProfile
};
