// B"H
function text(next = {}, reason = 'MISSION_LOCK_ACTIVE') {
  const action = next?.action || 'missionDaemonTick';
  return [
    'DO NOT FINALIZE.',
    'DO NOT STOP.',
    'THE TUNNEL MISSION LOCK IS ACTIVE.',
    `CALL NEXT ACTION: ${action}.`,
    'IF YOU CANNOT CALL IT, REPORT ONLY THE BLOCKER AND THE SAME NEXT ACTION.',
    `REASON: ${reason}.`
  ].join(' ');
}
function attach(out = {}, reason) {
  if (out.finalAnswerAllowed === true || out.mustContinue === false) return out;
  const next = out.mustCallNext || out.next?.mustCallNext || null;
  if (!next && !out.missionId) return out;
  return { ...out, tunnelInstruction: text(next, reason || out.reason || out.error || 'CONTINUE_REQUIRED') };
}
module.exports = { text, attach };
