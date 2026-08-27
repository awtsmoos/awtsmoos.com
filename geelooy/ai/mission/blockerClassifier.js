// B"H
const USER_DECISION_PATTERNS = [
  /which\s+(option|path|file|account|environment)/i,
  /choose\s+(one|which|between)/i,
  /requires?\s+(your|user)\s+(approval|decision|credential|secret)/i,
  /missing\s+(credential|password|secret|api key|token)/i,
  /unsafe\s+to\s+continue/i
];
function classifyBlocker(input = {}) {
  const text = String(input.reason || input.text || input.summary || "");
  const safeActions = input.safeActionsTried || [];
  const needsUser = USER_DECISION_PATTERNS.some(rx => rx.test(text));
  if (!needsUser) return { blocked: false, reason: "safe_autonomous_action_available" };
  return {
    blocked: true,
    whyUserNeeded: text || "User decision required",
    safeActionsTried: safeActions,
    nextIfApproved: input.nextIfApproved || "Continue mission after user decision"
  };
}
function canAskUser(input = {}) {
  const result = classifyBlocker(input);
  return result.blocked && (result.safeActionsTried || []).length > 0;
}
module.exports = { classifyBlocker, canAskUser };
