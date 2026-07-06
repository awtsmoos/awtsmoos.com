// B"H
const State = require("../sessions/state.js");
const { appendSessionEvent } = require("../sessions/journal.js");
const { writeSessionReceipt } = require("../sessions/receipts.js");
const { ensureProfileChrome } = require("../chrome/ensureProfileChrome.js");
const { waitUntilIdle, readIdleState } = require("../runtime/idleDetector.js");
const { chatgptMessage } = require("./message.js");
const { chatgptWorkflowGuidance } = require("../guidance.js");

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
  await appendSessionEvent(session.sessionId, { type:"continue_requested", turnsSent:session.turnsSent || 0 });
  const opened = await ensureProfileChrome({ ...payload, ...scope(session), url:session.url, navigate:true, verifyUrl:true });
  const beforeIdle = await waitUntilIdle({ ...payload, port:session.port, timeoutMs:payload.preIdleTimeoutMs || payload.timeoutMs || 180000, settleMs:payload.settleMs || 2500 });
  if (beforeIdle.ok === false && payload.requireIdleBeforeSend !== false) return await failed(session, "pre_send_not_idle", { opened, beforeIdle });
  const sent = await chatgptMessage({ ...payload, ...scope(session), url:session.url, conversationId:session.conversationId, message:payload.message || payload.prompt || session.prompt, port:session.port, timeoutMs:payload.timeoutMs || 180000 });
  const ok = sent.ok !== false;
  const receipt = await writeSessionReceipt(session.sessionId, { ok, prompt:payload.message || payload.prompt || session.prompt, text:sent.text || "", url:session.url, turn:Number(session.turnsSent || 0) + (ok ? 1 : 0), sent });
  const patch = { lastOpened:opened, lastIdle:beforeIdle, lastResult:sent, lastReceipt:receipt, lastResponseAt:new Date().toISOString(), turnsSent:Number(session.turnsSent || 0) + (ok ? 1 : 0), failures:Number(session.failures || 0) + (ok ? 0 : 1), status:ok ? "active" : "degraded" };
  const saved = await State.patchSession(session.sessionId, patch);
  await appendSessionEvent(session.sessionId, { type:ok ? "turn_completed" : "turn_failed", receiptId:receipt.receiptId, turnsSent:saved.turnsSent, ok });
  if (saved.status !== "active") return answer("chatgptSessionContinue", saved, { sent, receipt, conclusionAction:conclusionPayload(saved) });
  return answer("chatgptSessionContinue", saved, { sent, receipt, nextAction:continuePayload(saved) });
}

async function chatgptSessionAuto(payload = {}) {
  let session = await sessionFor(payload);
  if (!session) session = await State.registerSession(payload);
  const limit = Math.max(1, Math.min(Number(payload.batchTurns || payload.maxBatchTurns || 1), 20));
  const results = [];
  for (let i = 0; i < limit; i++) { const result = await chatgptSessionContinue({ ...payload, sessionId:session.sessionId }); results.push(result); session = result.session; if (session?.status !== "active") break; }
  return answer("chatgptSessionAuto", session, { batchTurns:results.length, results, nextAction:session?.status === "active" ? continuePayload(session) : null });
}

async function chatgptSessionStop(payload = {}) { const session = await State.stopSession(payload.sessionId || payload.loopId, payload.reason || "user_stop"); if (!session) return notFound("chatgptSessionStop"); await appendSessionEvent(session.sessionId, { type:"stopped", reason:session.stopReason }); return answer("chatgptSessionStop", session, { stopped:true, conclusionAction:conclusionPayload(session) }); }
async function chatgptSessionConclusion(payload = {}) { const session = await sessionFor(payload); if (!session) return notFound("chatgptSessionConclusion"); return answer("chatgptSessionConclusion", session, { conclusion:{ sessionId:session.sessionId, url:session.url, status:session.status, turnsSent:session.turnsSent || 0, maxTurns:session.maxTurns, failures:session.failures || 0, stopReason:session.stopReason || "", lastText:session.lastResult?.text || "" } }); }
async function chatgptSessionDoctor(payload = {}) { const session = await sessionFor(payload); if (!session) return notFound("chatgptSessionDoctor"); return answer("chatgptSessionDoctor", session, { live:await liveState(session, payload), recommendations:["Use chatgptSessionContinue only when live.idle is true.", "Use chatgptSessionStop to halt this session."] }); }
async function chatgptListSessions() { return { ok:true, action:"chatgptListSessions", ...(await State.listSessions()) }; }
async function complete(session, reason) { const saved = await State.patchSession(session.sessionId, { status:"completed", completedAt:new Date().toISOString(), stopReason:reason }); await appendSessionEvent(session.sessionId, { type:"completed", reason }); return answer("chatgptSessionContinue", saved, { conclusionAction:conclusionPayload(saved) }); }
async function failed(session, reason, extra = {}) { const saved = await State.patchSession(session.sessionId, { status:"degraded", failures:Number(session.failures || 0) + 1, lastFailureReason:reason, ...extra }); await appendSessionEvent(session.sessionId, { type:"failed", reason }); return answer("chatgptSessionContinue", saved, { ok:false, reason, ...extra }); }
async function sessionFor(payload = {}) { return await State.getSession(payload.sessionId || payload.chatgptSessionId || payload.aiSessionId || payload.loopId); }
async function liveState(session, payload) { return await readIdleState({ ...payload, port:session.port }).catch(error => ({ ok:false, error:error.message })); }
function scope(session) { return { port:session.port, profile:session.profile, browserSessionId:session.browserSessionId || session.sessionId, agentSessionId:session.agentSessionId, logicalAgentId:session.logicalAgentId, roomId:session.roomId, missionId:session.missionId }; }
function continuePayload(session) { return { action:"chatgptSessionContinue", sessionId:session.sessionId }; }
function conclusionPayload(session) { return { action:session.conclusionAction || "chatgptSessionConclusion", sessionId:session.sessionId }; }
function answer(action, session, extra = {}) { return { ok:extra.ok !== false, action, session, ...extra, guidance:chatgptWorkflowGuidance(action, session), next:session?.status === "active" ? "The action already waits for idle/completion internally; call chatgptSessionContinue/chatgptAutoContinueWhenIdle only for the next desired turn." : "Run chatgptSessionConclusion for a final summary." }; }
function notFound(action) { return { ok:false, action, error:"chatgpt_session_not_found" }; }

module.exports = { chatgptRegisterSession, chatgptSessionStatus, chatgptSessionContinue, chatgptSessionAuto, chatgptSessionStop, chatgptSessionConclusion, chatgptSessionDoctor, chatgptListSessions };
