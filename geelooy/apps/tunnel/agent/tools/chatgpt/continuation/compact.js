// B"H

/**
 * B"H
 * Chapter 1934: The shliach carries only the glowing pebble.
 *
 * Continuation state must be small enough to pass between agents without
 * drowning them in old rivers. This module keeps the next step, the emergency
 * exits, and a tiny proof of what just happened.
 */
const MAX_TEXT = 900;

function sessionPacket(session = {}, extra = {}) {
  return clean({
    sessionId: session.sessionId,
    conversationId: session.conversationId,
    url: session.url,
    status: session.status,
    turnsSent: Number(session.turnsSent || 0),
    maxTurns: session.maxTurns,
    failures: Number(session.failures || 0),
    missionId: session.missionId || '',
    roomId: session.roomId || '',
    agentSessionId: session.agentSessionId || '',
    logicalAgentId: session.logicalAgentId || '',
    lastResponseAt: session.lastResponseAt || '',
    lastFailureReason: session.lastFailureReason || '',
    nextAction: session.status === 'active' ? { action: 'chatgptSessionContinue', sessionId: session.sessionId } : null,
    conclusionAction: { action: session.conclusionAction || 'chatgptSessionConclusion', sessionId: session.sessionId },
    handoffPrompt: prompt(session, extra),
    emergencyExit: emergencyExit(extra),
    evidence: compactEvidence(session, extra)
  });
}

function prompt(session = {}, extra = {}) {
  const lines = [
    'B"H Continue the mission from this compact handoff.',
    `Session: ${session.sessionId || 'unknown'}; conversation: ${session.conversationId || 'unknown'}.`,
    `Turns: ${Number(session.turnsSent || 0)}/${session.maxTurns || '?'}, status: ${session.status || 'unknown'}.`,
    extra.waiting ? `Wait reason: ${extra.waiting}. Do not send until idle.` : '',
    extra.sent ? 'A continuation prompt was just sent; wait for the assistant to finish before sending another.' : '',
    'Use only the next required tool/action. Do not paste old logs. Stop only for emergencyExit.'
  ].filter(Boolean);
  return lines.join('\n');
}

function compactEvidence(session = {}, extra = {}) {
  return clean({
    liveIdle: extra.live?.idle,
    liveBusy: extra.live?.busy,
    liveHref: extra.live?.href,
    sentOk: extra.sent?.ok,
    sendVia: extra.sent?.sent?.via || extra.sent?.response?.sent?.via,
    lastText: shorten(session.lastResult?.text || extra.live?.text || '')
  });
}

function emergencyExit(extra = {}) {
  return [
    'user_stop',
    'not_authenticated',
    'unexpected_navigation',
    'composer_missing',
    'repeated_send_failure',
    extra.error || ''
  ].filter(Boolean);
}

function shorten(value) {
  const text = String(value || '');
  return text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT)}…` : text;
}

function clean(obj) {
  for (const key of Object.keys(obj)) if (obj[key] === undefined || obj[key] === null || obj[key] === '') delete obj[key];
  return obj;
}

module.exports = { sessionPacket, prompt, compactEvidence, emergencyExit, shorten };
