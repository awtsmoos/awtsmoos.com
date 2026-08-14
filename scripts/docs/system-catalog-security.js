//B"H
//Boruch Hashem
//Blessed is He

/** @file system-catalog-security.js @description The Awtsmoos lets trust boundaries stay distinct: identity, authorization, ownership, configuration, and realtime admission are not one claim. */

module.exports = [
	{
		id: "session-authentication", district: "security", title: "Session Authentication",
		summary: "Canonical HTTP session authentication and reuse of the same verifier for WebSocket upgrades.",
		manuals: ["docs/SECURITY/README.md", "docs/SECURITY/TRUST_BOUNDARIES.md"], projects: ["ayzarim/awtsmoosDynamicServer"],
		sources: ["ayzarim/awtsmoosDynamicServer/server/authSetup.js"], generated: ["docs/GENERATED/ENVIRONMENT_VARIABLES.md"],
		tags: ["identity", "session", "websocket", "security"],
		claimsBoundary: "Authentication establishes a verified identity source; it does not by itself authorize a resource operation.",
		changeRisk: "Secret loading, fallback behavior, middleware order, and socket verifier changes are security-sensitive."
	},
	{
		id: "oauth-bearer-identity", district: "security", title: "OAuth Bearer Identity",
		summary: "OAuth route/token surface and server-side use of verified bearer records as authoritative identity.",
		manuals: ["docs/SECURITY/TRUST_BOUNDARIES.md", "docs/TUTORIALS/API/OAUTH.md"], projects: ["geelooy/api/oauth", "geelooy/api/tunnel"],
		sources: ["geelooy/api/oauth/_awtsmoos.derech.js", "geelooy/api/tunnel/control/core/auth.js"], generated: ["docs/GENERATED/API_TUTORIAL_INDEX.md"],
		tags: ["identity", "oauth", "bearer", "security"],
		claimsBoundary: "A bearer token becomes identity only after server-side verification; request fields are not trusted substitutes.",
		changeRisk: "Token validation, expiry, issuer/subject, scope, or CORS behavior is security-sensitive."
	},
	{
		id: "tunnel-control-identity", district: "security", title: "Tunnel Control Identity",
		summary: "Tunnel Control resolves session, OAuth, or verified API-key identity into one authoritative account record.",
		manuals: ["docs/SECURITY/TRUST_BOUNDARIES.md", "docs/TUTORIALS/API/TUNNEL_CONTROL.md"], projects: ["geelooy/api/tunnel"],
		sources: ["geelooy/api/tunnel/control/core/auth.js"], generated: ["docs/GENERATED/API_TUTORIAL_INDEX.md"],
		tags: ["identity", "api-key", "oauth", "session", "tunnel"],
		claimsBoundary: "The identity resolver rejects browser-supplied owner fields as authority; downstream permissions remain separate.",
		changeRisk: "Identity-source precedence, API-key verification, and account normalization directly affect authorization inputs."
	},
	{
		id: "authorization-resource-ownership", district: "security", title: "Authorization and Resource Ownership",
		summary: "Account-scoped ownership, explicit grants, permissions, and anti-enumeration behavior above authentication.",
		manuals: ["docs/SECURITY/README.md", "docs/SECURITY/TRUST_BOUNDARIES.md"], projects: ["geelooy/api/tunnel", "geelooy/api/social"],
		sources: ["geelooy/api/tunnel/control/core/tunnelSecurity/authorization.js"], generated: [],
		tags: ["authorization", "ownership", "grants", "permissions", "security"],
		claimsBoundary: "This packet demonstrates one inspected authorization boundary; it is not a repository-wide security audit.",
		changeRisk: "Ownership/grant resolution and information-disclosure behavior are high-impact security contracts."
	},
	{
		id: "secrets-runtime-config", district: "security", title: "Secrets and Runtime Configuration",
		summary: "Environment/configuration names that influence runtime/security while secret values remain deliberately unread.",
		manuals: ["docs/SECURITY/SECRETS_AND_CONFIG.md", "docs/SECURITY/README.md"], projects: ["ayzarim/awtsmoosDynamicServer", "geelooy/api/oauth", "geelooy/api/tunnel"],
		sources: ["ayzarim/awtsmoosDynamicServer/server/authSetup.js"], generated: ["docs/GENERATED/ENVIRONMENT_VARIABLES.md"],
		tags: ["environment", "secret-name", "configuration", "security"],
		claimsBoundary: "Only environment variable names/classes/source locations are evidence; no value is read, stored, or published.",
		changeRisk: "Secret/config precedence and insecure fallback behavior can alter trust guarantees."
	},
	{
		id: "realtime-identity-admission", district: "security", title: "Realtime Identity and Admission",
		summary: "Trusted WebSocket identity, origin/protocol/ticket checks, and Mission Room authority before realtime participation.",
		manuals: ["docs/SECURITY/REALTIME_SECURITY.md", "docs/WEBSOCKETS/MISSION_ROOMS.md"], projects: ["ayzarim/awtsmoosDynamicServer", "geelooy/api/tunnel"],
		sources: ["ayzarim/awtsmoosDynamicServer/websocket/core/socketUpgrade.js", "geelooy/api/tunnel/control/missionRooms/ticketIssuer.js", "geelooy/api/tunnel/control/missionRooms/missionAccess.js"],
		generated: ["docs/GENERATED/WEBSOCKET_EVENT_INDEX.md"], tags: ["identity", "authorization", "origin", "protocol", "websocket"],
		claimsBoundary: "Admission combines multiple checks; a successful HTTP identity alone does not prove room authority.",
		changeRisk: "Weakening ticket/origin/protocol/authority checks can cross a realtime security boundary."
	}
];
