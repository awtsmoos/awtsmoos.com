// B"H
const State = require("../sessions/state.js");
const { appendSessionEvent } = require("../sessions/journal.js");
const { writeSessionReceipt } = require("../sessions/receipts.js");
const { ensureProfileChrome } = require("../chrome/ensureProfileChrome.js");
const { readIdleState } = require("../runtime/idleDetector.js");
const { chatgptMessage } = require("./message.js");
const { chatgptWorkflowGuidance } = require("../guidance.js");
const Defaults = require("../continuation/defaults.js");
const Compact = require("../continuation/compact.js");

/**
 * B"H
 * Chapter 1936: The conversation continues by ticks, not by captivity.
 *
 * A pasted ChatGPT URL becomes a saved session. Each tick opens the page, checks
 * whether the assistant is finished, sends one compact prompt only when idle,
 * and returns immediately with a handoff packet for the next agent.
 */
async function chatgptRegisterSession(payload = {}) {
  const session = await State.registerSession(payload);
  await appendSessionEvent(session.sessionId, { type:"registered", url:session.url, conversationId:session.conversationId });
  return answer("chatgptRegisterSession", session, { registered:true, nextAction:continuePayload(session) });
}
async function chatgptSessionStatus(payload = {}) {
  const session = await sessionFor(payload);
  if (!session) return notFound("chatgptSessionStatus");
  const live = payload.live === true ? await liveState(session, payload) : null;
  return answer("chatgptSessionStatus", session, { live });
}
async function chatgptSessionContinue(payload = {}) {
  let session = await sessionFor(payload);
  if (!session) session = await State.registerSession(payload);
  if (session.status !== "active") return answer("chatgptSessionContinue", session, { skipped:true, reason:"session_not_active", conclusionAction:conclusionPayload(session) });
  if (Number(session.turnsSent || 0) >= Number(session.maxTurns || 40)) return await complete(session, "max_turns_reached");
  await appendSessionEvent(session.sessionId, { type:"tick", turnsSent:session.turnsSent || 0 });
  const opened = await ensureProfileChrome({ ...payload, ...scope(session), url:session.url, navigate:true, verifyUrl:true, timeoutMs:Defaults.shortTimeout(payload.timeoutMs) });
  const live = await liveState(session, payload);
  if (live.ok === false || live.idle !== true) return answer("chatgptSessionContinue", session, { opened, live, waiting:"assistant_not_finished_or_page_not_ready", nextAction:continuePayload(session) });
  const sent = await chatgptMessage({ ...payload, ...scope(session), url:session.url, conversationId:session.conversationId, message:payload.message || payload.prompt || session.prompt, port:session.port, timeoutMs:Defaults.shortTimeout(payload.timeoutMs), settleMs:Defaults.settleMs(payload.settleMs), awaitResponse:false, shortCycle:true });
  const ok = sent.ok !== false;
  const receipt = await writeSessionReceipt(session.sessionId, { ok, prompt:payload.message || payload.prompt || session.prompt, url:session.url, turn:Number(session.turnsSent || 0) + (ok ? 1 : 0), sent });
  const patch = { lastOpened:opened, lastIdle:live, lastResult:sent, lastReceipt:receipt, lastResponseAt:new Date().toISOString(), turnsSent:Number(session.turnsSent || 0) + (ok ? 1 : 0), failures:Number(session.failures || 0) + (ok ? 0 : 1), status:ok ? "active" : "degraded" };
  const saved = await State.patchSession(session.sessionId, patch);
  await appendSessionEvent(session.sessionId, { type:ok ? "prompt_submitted" : "prompt_failed", receiptId:receipt.receiptId, turnsSent:saved.turnsSent, ok });
  return answer("chatgptSessionContinue", saved, ok ? { sent, receipt, nextAction:continuePayload(saved) } : { ok:false, sent, receipt, conclusionAction:conclusionPayload(saved) });
}
async function chatgptSessionAuto(payload = {}) {
  let session = await sessionFor(payload);
  if (!session) session = await State.registerSession(payload);
  const limit = Math.max(1, Math.min(Number(payload.batchTurns || payload.maxBatchTurns || 1), 3));
  const results = [];
  for (let i = 0; i < limit; i++) { const result = await chatgptSessionContinue({ ...payload, sessionId:session.sessionId }); results.push(Compact.sessionPacket(result.session || session, result)); session = result.session || session; if (result.waiting || session?.status !== "active") break; }
  return answer("chatgptSessionAuto", session, { batchTurns:results.length, results, nextAction:session?.status === "active" ? continuePayload(session) : null });
}
async function chatgptSessionStop(payload = {}) { const session = await State.stopSession(payload.sessionId || payload.loopId, payload.reason || "user_stop"); if (!session) return notFound("chatgptSessionStop"); await appendSessionEvent(session.sessionId, { type:"stopped", reason:session.stopReason }); return answer("chatgptSessionStop", session, { stopped:true, conclusionAction:conclusionPayload(session) }); }
async function chatgptSessionConclusion(payload = {}) { const session = await sessionFor(payload); if (!session) return notFound("chatgptSessionConclusion"); return answer("chatgptSessionConclusion", session, { conclusion:Compact.sessionPacket(session) }); }
async function chatgptSessionDoctor(payload = {}) { const session = await sessionFor(payload); if (!session) return notFound("chatgptSessionDoctor"); return answer("chatgptSessionDoctor", session, { live:await liveState(session, payload), recommendations:["Call chatgptSessionContinue repeatedly; it sends only when idle.", "Use chatgptSessionStop for emergency exit."] }); }
async function chatgptListSessions() { const listed = await State.listSessions(); return { ok:true, action:"chatgptListSessions", current:listed.current, sessions:(listed.sessions || []).map(s => Compact.sessionPacket(s)) }; }
async function complete(session, reason) { const saved = await State.patchSession(session.sessionId, { status:"completed", completedAt:new Date().toISOString(), stopReason:reason }); await appendSessionEvent(session.sessionId, { type:"completed", reason }); return answer("chatgptSessionContinue", saved, { conclusionAction:conclusionPayload(saved) }); }
async function sessionFor(payload = {}) { return await State.getSession(payload.sessionId || payload.chatgptSessionId || payload.aiSessionId || payload.loopId); }
async function liveState(session, payload) { return await readIdleState({ ...payload, port:session.port, evalTimeoutMs:Defaults.shortTimeout(payload.evalTimeoutMs) }).catch(error => ({ ok:false, error:error.message })); }
function scope(session) { return { port:session.port, profile:session.profile, browserSessionId:session.browserSessionId || session.sessionId, agentSessionId:session.agentSessionId, logicalAgentId:session.logicalAgentId, roomId:session.roomId, missionId:session.missionId }; }
function continuePayload(session) { return { action:"chatgptSessionContinue", sessionId:session.sessionId }; }
function conclusionPayload(session) { return { action:session.conclusionAction || "chatgptSessionConclusion", sessionId:session.sessionId }; }
function answer(action, session, extra = {}) { const packet = Compact.sessionPacket(session, extra); return { ok:extra.ok !== false, action, session:packet, ...extra, compact:true, guidance:chatgptWorkflowGuidance(action, session), next:packet.nextAction ? "Short tick complete. Call nextAction later; do not hold the gateway." : "Run conclusionAction if final summary is needed." }; }
function notFound(action) { return { ok:false, action, error:"chatgpt_session_not_found" }; }
module.exports = { chatgptRegisterSession, chatgptSessionStatus, chatgptSessionContinue, chatgptSessionAuto, chatgptSessionStop, chatgptSessionConclusion, chatgptSessionDoctor, chatgptListSessions };
