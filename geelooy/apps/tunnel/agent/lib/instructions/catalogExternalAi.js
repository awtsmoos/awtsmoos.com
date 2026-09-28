// B"H
// Boruch Hashem
// Blessed is He

const { instructionPack } = require("./pack.js");

/**
 * @file Reveals the persistent external-AI handoff only when intent calls for it.
 * @description
 * The Awtsmoos lets one small request open a durable gate while Awtsmoos.com keeps
 * authorization, automatic routing, insurance, custody, collaboration, and healing distinct and true.
 */
const externalAiInstructions = Object.freeze([
	instructionPack({
		id: "integration.external-ai-connection",
		version: 4,
		summary: "Give a copy-ready external-AI workflow with persistent auth, automatic route selection, insurance failover, collaboration, and honest fault classification.",
		tags: ["external-ai", "agent-link", "oauth", "pkce", "device-authorization", "tunnel-connection", "recovery", "multi-agent"],
		requiredBeforeWrite: false,
		applies: {
			taskHints: [
				"connect me to an external ai", "connect external ai", "connect another ai",
				"external ai", "external agent", "another ai to my tunnel", "ai to my tunnel",
				"connect musa", "connect muse", "connect claude", "connect gemini"
			]
		},
		instructions: [
			"Default to one complete copy-ready prompt unless the user asks for another format.",
			"Read current OAuth metadata, tunnel docs, docs.json, bootstrap, and agent-manifest before assuming auth, routing, or action schemas.",
			"Classify OAuth health separately from native tunnel health. Broken OAuth does not imply the local tunnel agent should be reinstalled.",
			"Repeated identical 5xx ROUTE_ERROR responses across /api/oauth/* indicate an OAuth server/router defect unless fresh evidence proves otherwise; do not casually call a deterministic failure transient.",
			"Never promise background monitoring. Report verified current state and perform the exact next foreground probe instead.",
			"Use client_id=external-agent. Prefer persistent Agent Links when metadata advertises them; otherwise use authorization-code + PKCE or device authorization for headless clients.",
			"Treat agent_link_secret as a durable machine credential stored only in a secure connector vault. Never echo it, access tokens, refresh tokens, authorization headers, cookies, API keys, or PKCE verifiers into chat.",
			"For Agent Link sessions, exchange the secret at /api/oauth/token using the advertised grant type, then use ordinary short-lived access/refresh tokens. Stop using refresh lineage after link revocation.",
			"For device authorization, POST /api/oauth/device-authorization, show verification_uri_complete or verification URI plus user_code, then poll /api/oauth/token while respecting interval, authorization_pending, slow_down, expiry, and denial.",
			"After authentication and after every route failure, call /api/tunnel/control/my-device. Consume selectedRoute automatically and retain insuranceRoutes as ordered warm recovery.",
			"Never ask the user 'primary or recovery?' when my-device says humanChoiceRequired=false. Ask only when humanChoiceRequired=true because genuinely different devices or surfaces remain ambiguous.",
			"Route with selectedRoute.routeReference when present, falling back only to the documented immutable tunnel identifier. Friendly tunnel names are display labels, not routing identity.",
			"If the selected route fails, rediscover with my-device and follow the new selectedRoute. Do not remember or force an older primary merely because it was previously selected.",
			"Before carrying cwd or relative paths onto an insurance route, rediscover that route's project root and capabilities. Different insurance agents may expose different authorized roots; never concatenate a previous route's absolute root.",
			"A stale recentSuccess timestamp on an otherwise connected, execution-healthy, mailbox-healthy idle insurance route is inactivity, not proof of failure. Prefer current liveness evidence over historical idleness.",
			"If a mutation was accepted or has a durable receipt/job ID, observe that exact receipt/job first. Never duplicate it on another route unless the receipt explicitly proves safeToReplay=true.",
			"Use multi-agent collaboration: missions, rooms, task claims, file claims, heartbeats, messages, and handoffs when hundreds of agents share one workspace so they coordinate instead of overwriting each other.",
			"Discover capabilities and project root before filesystem work, read agents.md/local instructions, and preserve route-relative path intent across failover.",
			"Preferred sequence: metadata/docs -> durable auth -> my-device -> selectedRoute + insuranceRoutes -> capabilities/root -> multi-agent collaboration -> work -> receipt observation -> automatic rediscovery on route failure."
		]
	})
]);

module.exports = { externalAiInstructions };
