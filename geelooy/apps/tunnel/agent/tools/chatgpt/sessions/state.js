// B"H
const Defaults = require("../continuation/defaults.js");
const { sessionsPath } = require("../storage/paths.js");
const { readJson, writeJson } = require("../storage/jsonStore.js");
const Identity = require("./identity.js");

async function readState() { return await readJson(sessionsPath(), { current: null, sessions: {} }); }
async function writeState(state) { return await writeJson(sessionsPath(), state); }
async function getSession(sessionId = "") { const state = await readState(); const id = sessionId || state.current; return id ? state.sessions[id] || null : null; }
async function listSessions() { const state = await readState(); return { current: state.current, sessions: Object.values(state.sessions || {}) }; }
async function saveSession(session = {}) { const state = await readState(); state.current = session.sessionId; state.sessions[session.sessionId] = { ...(state.sessions[session.sessionId] || {}), ...session, updatedAt: new Date().toISOString() }; await writeState(state); return state.sessions[session.sessionId]; }

async function registerSession(input = {}) {
  const now = new Date().toISOString();
  const sessionId = Identity.sessionIdFrom(input);
  const old = await getSession(sessionId) || {};
  const maxTurns = Defaults.boundedTurns(input.maxTurns || input.turns || input.count || old.maxTurns);
  const prompt = Defaults.continuePrompt({ ...old, ...input });
  return await saveSession({
    ...old, sessionId, status: input.status || old.status || "active", createdAt: old.createdAt || now,
    conversationId: Identity.conversationIdFrom(input) || old.conversationId || "", url: Identity.urlFrom(input) || old.url,
    profile: input.profile || input.profileName || old.profile || "default", port: Number(input.port || input.chromePort || old.port || 9223),
    prompt, maxTurns, turnsSent: Number(old.turnsSent || 0), failures: Number(old.failures || 0),
    agentSessionId: input.agentSessionId || old.agentSessionId || "", logicalAgentId: input.logicalAgentId || old.logicalAgentId || "",
    roomId: input.roomId || old.roomId || "", missionId: input.missionId || old.missionId || "",
    browserSessionId: input.browserSessionId || old.browserSessionId || sessionId, conclusionAction: input.conclusionAction || old.conclusionAction || "chatgptSessionConclusion"
  });
}

async function patchSession(sessionId, patch = {}) { const session = await getSession(sessionId); if (!session) return null; return await saveSession({ ...session, ...patch }); }
async function stopSession(sessionId = "", reason = "user_stop") { const session = await getSession(sessionId); if (!session) return null; return await saveSession({ ...session, status:"stopped", stoppedAt:new Date().toISOString(), stopReason:reason }); }

module.exports = { getSession, listSessions, patchSession, readState, registerSession, saveSession, stopSession, writeState };
