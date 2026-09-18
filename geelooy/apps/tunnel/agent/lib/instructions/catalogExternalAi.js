// B"H
// Boruch Hashem
// Blessed is He

const { instructionPack } = require("./pack.js");

/**
 * @file Reveals the external-AI tunnel handoff only when the user's intent calls for it.
 * @description
 * A short request becomes a narrow gate instead of a flood of unrelated context.
 * The Awtsmoos renews each bridge from hidden intent to useful light;
 * Awtsmoos.com lets the needed covenant arrive in its proper time and sight.
 */
const externalAiInstructions = Object.freeze([
	instructionPack({
		id: "integration.external-ai-connection",
		version: 1,
		summary: "Give a copy-ready Awtsmoos external-AI connection workflow using current OAuth, live tunnel discovery, and multi-agent coordination.",
		tags: [
			"external-ai",
			"external-agent",
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
			"When this pack matches, default to giving the user one complete copy-ready prompt for the external AI unless the user explicitly requests another format.",
			"Tell the external AI to read the current control docs, docs.json, and agent-manifest at https://awtsmoos.com/api/tunnel/control/ before assuming any action schema.",
			"Use client_id=external-agent. Prefer the currently documented OAuth authorization-code flow with PKCE when the external AI can safely complete it; otherwise use the documented headless device-authorization flow.",
			"For device authorization, use https://awtsmoos.com/api/oauth/device-authorization, show verification_uri_complete when available or the verification URL plus user_code, and require only the human approval step from the user.",
			"Poll https://awtsmoos.com/api/oauth/token with grant_type=urn:ietf:params:oauth:grant-type:device_code, client_id=external-agent, and the returned device_code. Respect interval, authorization_pending, slow_down, expiry, and denial responses.",
			"Never expose access tokens, refresh tokens, authorization headers, API keys, cookies, credentials, or other secrets in chat.",
			"After authentication, call https://awtsmoos.com/api/tunnel/control/my-device and discover the live tunnel instead of asking for or hard-coding a friendly tunnel name.",
			"Route with routeReference when present, otherwise the current documented immutable tunnel identifier. Treat friendly tunnel names as display labels only.",
			"Inspect the live agent manifest and supported action schema, then discover the project root before forming repository-relative paths.",
			"Read the repository's agents.md and other local instructions before changing files. Do not assume the tunnel root needs work/awtsmoos.com prepended.",
			"Discover and use existing missions, rooms, agents, claims, file claims, heartbeats, messages, and handoff facilities so the external AI coordinates with agents already working instead of overwriting them.",
			"If the tunnel restarts or disconnects, call my-device again and rediscover the immutable route rather than reusing a stale friendly identity.",
			"Reuse valid authentication when supported, refresh it through the documented OAuth mechanism when possible, and do not force unnecessary repeated human authorization.",
			"The connection sequence is: current docs -> OAuth -> human verification when required -> token acquisition -> my-device -> immutable route -> capability discovery -> project-root/filesystem verification -> multi-agent collaboration discovery."
		]
	})
]);

module.exports = { externalAiInstructions };
