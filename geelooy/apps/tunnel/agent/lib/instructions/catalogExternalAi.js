// B"H
// Boruch Hashem
// Blessed is He

const { instructionPack } = require("./pack.js");

/**
 * @file Reveals the persistent external-AI handoff only when intent calls for it.
 * @description
 * The Awtsmoos lets a small phrase open exactly one needed gate;
 * Awtsmoos.com prefers a durable Agent Link, yet keeps device OAuth as a faithful fallback state.
 */
const externalAiInstructions = Object.freeze([
	instructionPack({
		id: "integration.external-ai-connection",
		version: 2,
		summary: "Give a copy-ready persistent Awtsmoos external-AI workflow with Agent Link preference, OAuth fallback, live tunnel discovery, and collaboration.",
		tags: [
			"external-ai",
			"external-agent",
			"agent-link",
			"oauth",
			"device-authorization",
			"pkce",
			"tunnel-connection"
		],
		requiredBeforeWrite: false,
		applies: {
			taskHints: [
				"connect me to an external ai",
				"connect external ai",
				"connect another ai",
				"external ai",
				"external agent",
				"another ai to my tunnel",
				"ai to my tunnel",
				"connect musa",
				"connect muse",
				"connect claude",
				"connect gemini"
			]
		},
		instructions: [
			"When this pack matches, default to one complete copy-ready prompt for the external AI unless the user asks for another format.",
			"Tell the external AI to read current OAuth metadata plus tunnel docs, docs.json, and agent-manifest before assuming any auth or action schema.",
			"Use client_id=external-agent. If OAuth metadata advertises awtsmoos_agent_links_endpoint and awtsmoos_agent_link_grant_type, prefer a persistent Agent Link over re-running human authorization every session.",
			"An Agent Link is account-owned and tunnel-independent. Never bind it to a friendly tunnel name, tunnel ID, or one chat session.",
			"Create an Agent Link only through the authenticated management endpoint. Treat agent_link_secret as a durable machine credential: receive it once, store it in the external connector's secure vault outside chat, and never echo it to the conversation.",
			"For later sessions, POST agent_link_secret to https://awtsmoos.com/api/oauth/token with client_id=external-agent and the advertised Agent Link grant type. Never put Agent Link secrets in query strings or URLs.",
			"Use the returned ordinary short-lived access/refresh tokens for API calls. If the Agent Link is revoked, stop using its refresh lineage and require a newly approved link.",
			"If Agent Link persistence is unavailable or the external platform cannot securely retain connector credentials, keep using the existing OAuth authorization-code + PKCE flow or headless device-authorization fallback.",
			"For device authorization, use https://awtsmoos.com/api/oauth/device-authorization, show verification_uri_complete when available or verification URL plus user_code, and require only human approval.",
			"Poll https://awtsmoos.com/api/oauth/token with grant_type=urn:ietf:params:oauth:grant-type:device_code, client_id=external-agent, and device_code; respect interval, authorization_pending, slow_down, expiry, and denial.",
			"Never expose Agent Link secrets, access tokens, refresh tokens, authorization headers, API keys, cookies, credentials, or other secrets in chat.",
			"After every fresh authentication or recovered session, call https://awtsmoos.com/api/tunnel/control/my-device and discover the currently live tunnel rather than remembering a prior route.",
			"Route with routeReference when present, otherwise the current documented immutable tunnel identifier. Friendly tunnel names are display labels only.",
			"Inspect live capabilities and discover the project root before forming paths. Read agents.md and local instructions before writing.",
			"Discover and use missions, rooms, agents, claims, file claims, heartbeats, messages, and handoffs so multiple AIs coordinate rather than overwrite each other.",
			"If the tunnel disappears, preserve authentication, retry my-device, and rediscover the route. Tunnel availability and authorization are separate states.",
			"Preferred sequence: current metadata/docs -> persistent Agent Link when supported -> token exchange -> my-device -> live route -> capabilities/root -> collaboration. Fallback sequence remains PKCE/device OAuth -> my-device -> live route."
		]
	})
]);

module.exports = { externalAiInstructions };
