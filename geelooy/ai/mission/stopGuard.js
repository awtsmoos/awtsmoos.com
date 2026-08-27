// B"H
const PREMATURE_STOP_PATTERNS = [
  /\blet me know\b/i,
  /\bwould you like me to\b/i,
  /\bshould i\b/i,
  /\bi can (continue|do|start|next)\b/i,
  /\bif you want\b/i,
  /\bshall i\b/i,
  /\btell me if\b/i
];
function findPrematureStop(text = "") {
  return PREMATURE_STOP_PATTERNS.filter(rx => rx.test(String(text))).map(rx => rx.source);
}
function assertMayStop(mission, responseText = "") {
  const remaining = (mission.remainingWork || []).length;
  const nextAction = mission.nextAction;
  const matches = findPrematureStop(responseText);
  const blocked = mission.status === "blocked";
  if (!remaining && !nextAction && !matches.length) return { ok: true };
  if (blocked && (mission.blockers || []).length) return { ok: true, blocked: true };
  return {
    ok: false,
    prematureStop: true,
    reason: "mission_has_remaining_work_or_stop_phrase",
    remainingWork: remaining,
    nextAction,
    matches
  };
}
function mustContinue(mission) {
  return !assertMayStop(mission, "").ok;
}
module.exports = { PREMATURE_STOP_PATTERNS, findPrematureStop, assertMayStop, mustContinue };
