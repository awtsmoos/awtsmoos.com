// B"H
const Sessions = require("./sessions.js");
const State = require("../sessions/state.js");

/** B"H: legacy continuation names now ride the stronger session engine. */
async function chatgptContinuationStart(payload = {}) { const got = await Sessions.chatgptRegisterSession(payload); return legacy("chatgptContinuationStart", got, { started:true }); }
async function chatgptContinuationStatus(payload = {}) { const got = await Sessions.chatgptSessionStatus(payload); return legacy("chatgptContinuationStatus", got); }
async function chatgptContinuationStop(payload = {}) { const got = await Sessions.chatgptSessionStop(payload); return legacy("chatgptContinuationStop", got, { stopped:got.stopped }); }
async function chatgptContinuationTick(payload = {}) { const got = await Sessions.chatgptSessionContinue(payload); return legacy("chatgptContinuationTick", got); }
async function chatgptContinuationAuto(payload = {}) { const got = await Sessions.chatgptSessionAuto(payload); return legacy("chatgptContinuationAuto", got); }
async function chatgptContinuationConclusion(payload = {}) { const got = await Sessions.chatgptSessionConclusion(payload); return legacy("chatgptContinuationConclusion", got); }

function legacy(action, got = {}, extra = {}) { const loop = got.session ? sessionToLoop(got.session) : null; return { ...got, ...extra, action, loop, nextAction:got.nextAction, conclusionAction:got.conclusionAction }; }
function sessionToLoop(session = {}) { return { loopId:session.sessionId, conversationId:session.conversationId, url:session.url, status:session.status, turnsSent:session.turnsSent || 0, failures:session.failures || 0, maxTurns:session.maxTurns, prompt:session.prompt, profile:session.profile, port:session.port, agentSessionId:session.agentSessionId, logicalAgentId:session.logicalAgentId, roomId:session.roomId, missionId:session.missionId, lastResult:session.lastResult || null }; }

module.exports = { chatgptContinuationStart, chatgptContinuationStatus, chatgptContinuationStop, chatgptContinuationTick, chatgptContinuationAuto, chatgptContinuationConclusion, sessionToLoop };
