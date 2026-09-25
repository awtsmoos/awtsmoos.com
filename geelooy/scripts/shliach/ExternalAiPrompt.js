// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds the copy-ready covenant that teaches another AI how to enter Awtsmoos safely.
 * @description
 * The Awtsmoos is beyond every tunnel and token; Awtsmoos.com gives changing agents
 * a truthful path from consent to account to the living machine they are meant to serve.
 */
const MODE_NOTES = {
	automatic: "Prefer a persistent Agent Link only when current OAuth metadata advertises it and you can store its secret outside chat. Otherwise use PKCE or device authorization.",
	persistent: "If current metadata advertises Agent Links, use that persistent path and store its secret only in your secure connector vault. Otherwise fall back to device authorization.",
	device: "Use the OAuth device-authorization flow. Show me only the verification URL/code, then continue after approval.",
	browser: "Use authorization-code OAuth with PKCE S256 when your browser/callback environment supports it."
};

/** Returns one credentials-free external-agent onboarding prompt for the selected mode. */
export function buildExternalAiPrompt(mode = "automatic") {
	const modeNote = MODE_NOTES[mode] || MODE_NOTES.automatic;
	return `B"H

Connect yourself to my Awtsmoos account as an external AI agent.

${modeNote}

1. Read https://awtsmoos.com/api/oauth/metadata first. Treat it as the source of truth for currently published OAuth capabilities.
2. Read https://awtsmoos.com/api/tunnel/control/docs, /api/tunnel/control/docs.json, and /api/tunnel/control/agent-manifest before assuming any tunnel action schema.
3. Use client_id=external-agent.
4. Never ask me to paste access tokens, refresh tokens, Agent Link secrets, cookies, API keys, or Authorization headers into chat.
5. If metadata advertises awtsmoos_agent_links_endpoint and awtsmoos_agent_link_grant_type, you may prefer the persistent Agent Link flow only when you can retain its credential in secure connector storage outside this conversation.
6. Otherwise use authorization-code + PKCE when possible, or POST to /api/oauth/device-authorization and use /api/oauth/device for human approval. Poll /api/oauth/token according to the documented device flow.
7. After authentication, call https://awtsmoos.com/api/tunnel/control/my-device. Do not ask me for or hard-code a friendly tunnel name.
8. Route with routeReference when present, otherwise the current documented immutable tunnel identifier.
9. Inspect the connected agent's current capabilities and discover the project root before forming paths. Do not blindly prepend work/awtsmoos.com.
10. Read the repository's agents.md and local instructions before changing files.
11. Discover existing missions, rooms, agents, claims, file claims, heartbeats, messages, and handoffs. Coordinate with agents already working instead of overwriting them.
12. If the tunnel disconnects or restarts, keep authorization separate from transport state: call my-device again and rediscover the live route.
13. Report that you are connected and what project root you verified, without exposing credentials.

Start by reading the current metadata and documentation, then begin the best available authorization flow.`;
}

export { MODE_NOTES };
