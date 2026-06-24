// B"H

const { actionAllowedWhilePending, answerFromPayload, blockerProofOk } = require("./protocolGatePolicy.js");
const gates = new Map();
const TTL_MS = 30 * 60 * 1000;

/** B"H — Chapter 822: The answer gate remembered the room, not just the mask. */
function gateKeys(payload = {}) {
  const keys = new Set();
  add(keys, payload.logicalAgentId); add(keys, payload.agentSessionId); add(keys, payload.clientRequestId);
  add(keys, ["conversation", payload.conversationId || payload.conversationName, payload.tunnelName || payload.requestedTunnelName].filter(Boolean).join(":"));
  add(keys, ["tunnel", payload.tunnelName || payload.requestedTunnelName, payload.missionId].filter(Boolean).join(":"));
  return [...keys].filter(Boolean);
}
function add(keys, value) { if (value && value !== "anonymous") keys.add(String(value)); }
function armProtocolGate(payload = {}, gate = null) {
  if (!gate?.required) return;
  const record = { ...gate, jobId: payload.jobId || gate.jobId || "", armedAt: Date.now(), expiresAt: Date.now() + TTL_MS };
  for (const key of gateKeys(payload)) gates.set(key, record);
}
function clearProtocolGate(payload = {}) { for (const key of gateKeys(payload)) gates.delete(key); }
function pendingProtocolGate(payload = {}) {
  for (const key of gateKeys(payload)) {
    const gate = gates.get(key);
    if (!gate) continue;
    if (gate.expiresAt < Date.now()) { gates.delete(key); continue; }
    return gate;
  }
  return null;
}
function enforceProtocolGate(payload = {}) {
  const pending = pendingProtocolGate(payload);
  if (!pending) return null;
  const answer = answerFromPayload(payload);
  if (answer && blockerProofOk(answer, payload)) { clearProtocolGate(payload); return null; }
  if (answer) return blockedResponse(pending, payload, `Answer ${answer} needs blocker/completion proof.`);
  const allowed = actionAllowedWhilePending(payload, pending);
  if (allowed.ok) return null;
  return blockedResponse(pending, payload, "BEFORE YOU GO ON FIRST ANSWER THIS MULTIPLE CHOICE.");
}
function blockedResponse(gate, payload = {}, note = "") {
  return { BH: "B\"H", ok: false, status: 409, error: "multiple_choice_answer_required", action: payload.action || "unknown", responseFocus: { action: "multipleChoiceAnswer", oneMainThing: `BEFORE YOU GO ON FIRST ANSWER THIS: ${gate.question}`, mustAnswerGate: true, nextAction: { action: "finishAndContinue", continuationPrompt: `${gate.requiredChoice} - ${gate.requiredText}` } }, multipleChoiceSelfInterrogation: gate.publicQuestion, allCapsPrompt: `BEFORE YOU GO ON FIRST ANSWER THIS MULTIPLE CHOICE: ${gate.requiredChoice} - ${gate.requiredText}`, acceptedAnswerFormat: "Start the next call with B - continue with proof. A/C/D require proof fields.", note };
}
module.exports = { armProtocolGate, clearProtocolGate, enforceProtocolGate, pendingProtocolGate, answerFromPayload };
