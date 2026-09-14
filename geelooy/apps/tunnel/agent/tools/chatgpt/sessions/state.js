//B"H
//Boruch Hashem
//Blessed be He

const Defaults = require("../continuation/defaults.js");
const SharedBrowser = require("../chrome/sharedProfile.js");
const { sessionsPath } = require("../storage/paths.js");
const { readJson, writeJson } = require("../storage/jsonStore.js");
const Identity = require("./identity.js");

/**
 * @file Persists logical ChatGPT sessions without freezing physical browser transport.
 * @description
 * Session identity survives Chrome restarts, while every read/save rebinds the
 * stored port to the current device-owned Shared AI Browser when one is live.
 */
async function readState() {
	return await readJson(sessionsPath(), { current: null, sessions: {} });
}

/** Writes the complete durable session state atomically through the JSON store. */
async function writeState(state) {
	return await writeJson(sessionsPath(), state);
}

/** Returns one logical session rebound to the current physical browser authority. */
async function getSession(sessionId = "") {
	const state = await readState();
	const id = sessionId || state.current;
	return id ? bindBrowser(state.sessions[id] || null) : null;
}
/** Returns every logical session rebound to the current physical browser. */
async function listSessions() {
	const state = await readState();
	return {
		current: state.current,
		sessions: Object.values(state.sessions || {}).map(bindBrowser)
	};
}

/** Saves one session while refreshing only its replaceable browser transport. */
async function saveSession(session = {}) {
	const state = await readState();
	const next = bindBrowser({
		...(state.sessions[session.sessionId] || {}),
		...session,
		updatedAt: new Date().toISOString()
	});
	state.current = next.sessionId;
	state.sessions[next.sessionId] = next;
	await writeState(state);
	return next;
}

/** Creates or refreshes a logical session without creating another Chrome profile. */
async function registerSession(input = {}) {
	const now = new Date().toISOString();
	const sessionId = Identity.sessionIdFrom(input);
	const old = await getSession(sessionId) || {};
	const maxTurns = Defaults.boundedTurns(
		input.maxTurns || input.turns || input.count || old.maxTurns
	);
	const prompt = Defaults.continuePrompt({ ...old, ...input });
	return await saveSession({
		...old,
		sessionId,
		status: input.status || old.status || "active",
		createdAt: old.createdAt || now,
		conversationId: Identity.conversationIdFrom(input) || old.conversationId || "",
		url: Identity.urlFrom(input) || old.url,
		profile: input.profile || input.profileName || old.profile || "default",
		port: canonicalPort(input, old),
		prompt,
		maxTurns,
		turnsSent: Number(old.turnsSent || 0),
		failures: Number(old.failures || 0),
		agentSessionId: input.agentSessionId || old.agentSessionId || "",
		logicalAgentId: input.logicalAgentId || old.logicalAgentId || "",
		roomId: input.roomId || old.roomId || "",
		missionId: input.missionId || old.missionId || "",
		browserSessionId: input.browserSessionId || old.browserSessionId || sessionId,
		conclusionAction: input.conclusionAction || old.conclusionAction || "chatgptSessionConclusion"
	});
}

/** Applies a durable partial update while retaining current browser authority. */
async function patchSession(sessionId, patch = {}) {
	const session = await getSession(sessionId);
	return session ? await saveSession({ ...session, ...patch }) : null;
}
/** Stops one logical session without altering browser ownership. */
async function stopSession(sessionId = "", reason = "user_stop") {
	const session = await getSession(sessionId);
	return session ? await saveSession({
		...session,
		status: "stopped",
		stoppedAt: new Date().toISOString(),
		stopReason: reason
	}) : null;
}

/** Replaces stale persisted transport with the current Shared AI Browser port. */
function bindBrowser(session) {
	return session ? { ...session, port: canonicalPort({}, session) } : null;
}

function canonicalPort(input = {}, old = {}) {
	const authority = SharedBrowser.authority();
	if (authority.ok) return authority.port;
	return Number(input.port || input.chromePort || input.debugPort || old.port || 0);
}

module.exports = {
	getSession, listSessions, patchSession, readState,
	registerSession, saveSession, stopSession, writeState
};
