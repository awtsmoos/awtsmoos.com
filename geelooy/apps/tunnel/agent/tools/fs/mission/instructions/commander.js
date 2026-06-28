// B"H
function nextName(next = {}) { return next?.action || 'missionDaemonTick'; }
function missionName(out = {}, next = {}) { return out.missionId || next.missionId || ''; }
function whyLine(reason = 'CONTINUE_REQUIRED') { return `WHY YOU KEEP GOING: ${String(reason).toUpperCase()} MEANS THE MISSION STATE MACHINE HAS NOT RELEASED YOU YET.`; }
function scopeLine(out = {}) {
  if (out.blockedAction) return 'WHY THE BLOCK HAPPENED: THE ACTION WAS OUTSIDE THE ACTIVE MISSION PATH, SO THE TUNNEL IS PROTECTING CONTINUATION STATE FROM BEING LOST.';
  return 'WHY YOU HAVE CONTROL: INSIDE THE ACTIVE MISSION SCOPE YOU MAY CHOOSE THE BEST USEFUL WORK, AS LONG AS YOU KEEP PLANNING, IMPLEMENTING, VERIFYING, AND RECORDING PROOF.';
}
function actionLine(next = {}) { return `WHAT TO DO NOW: CALL ${nextName(next)} WITH THE RETURNED PAYLOAD. DO NOT INVENT A DIFFERENT NEXT ACTION UNTIL THAT ACTION IS DONE OR SAFELY IMPOSSIBLE.`; }
function workCycle() {
  return [
    'WORK CYCLE: FIRST INSPECT REAL FILES AND REAL STATE.',
    'THEN WRITE A SHORT PLAN.',
    'THEN BRAINSTORM BETTER OPTIONS.',
    'THEN LIST THE FILES YOU WILL TOUCH.',
    'THEN WRITE COMPLETE FILES ONLY.',
    'THEN RUN REAL VERIFICATION.',
    'THEN COMPARE PLANNED VERSUS ACTUAL.',
    'THEN FIND MORE REMAINING WORK.',
    'THEN CONTINUE WITH THE NEXT SAFE ACTION.'
  ];
}
function blockerRule() {
  return [
    'IF YOU THINK YOU ARE BLOCKED, DO NOT END THE MISSION.',
    'SAY THE BLOCKER IN PLAIN ENGLISH.',
    'SAVE THE EVIDENCE.',
    'CALL MISSIONBOOTRESUME IF THE MISSION ID IS MISSING.',
    'CALL MUSTCALLNEXT IF IT EXISTS.',
    'CALL MISSIONDAEMONTICK ONLY WHEN NO BETTER REQUIRED ACTION EXISTS.'
  ].join(' ');
}
function timeoutRule() {
  return 'IF CHATGPT TIMES OUT, THE BROWSER REFRESHES, A WEBSOCKET CLOSES, OR A 504 APPEARS, ASSUME THE WORK MAY STILL BE ALIVE. RECONNECT, READ AWTSMOOSDB HISTORY, READ THE LAST CHECKPOINT, THEN RESUME THE LATEST MUSTCALLNEXT.';
}
function freedomRules() {
  return [
    'YOU ARE ALLOWED TO KEEP GOING WITHOUT ASKING THE USER WHEN THE NEXT WORK IS SAFE AND DISCOVERABLE.',
    'YOU ARE ALLOWED TO CHOOSE IMPLEMENTATION DETAILS INSIDE THE USER REQUEST.',
    'YOU ARE NOT ALLOWED TO PRETEND COMPLETION WHILE MUSTCONTINUE IS TRUE.',
    'YOU ARE NOT ALLOWED TO STOP JUST BECAUSE THE RESPONSE COULD BE SUMMARIZED.'
  ];
}
function text(out = {}, next = {}, reason = 'CONTINUE_REQUIRED') {
  return [
    'PLAIN ENGLISH FOR THE AI AGENT:',
    'YOU ARE NOT DONE.',
    'THIS RESPONSE IS NOT A FINAL ANSWER.',
    whyLine(reason),
    scopeLine(out),
    actionLine(next),
    ...workCycle(),
    ...freedomRules(),
    blockerRule(),
    timeoutRule(),
    `MISSION ID: ${missionName(out, next) || 'UNKNOWN'}.`,
    `NEXT REQUIRED TUNNEL ACTION: ${nextName(next)}.`
  ].join(' ');
}
function operatingRules(out = {}, next = {}, reason = 'CONTINUE_REQUIRED') {
  return {
    commander: 'Awtsmoos mission commander',
    language: 'plain-English-all-caps',
    intent: 'keep going while safe useful work remains',
    reason,
    missionId: missionName(out, next),
    nextRequiredAction: nextName(next),
    fullFreedomInsideMissionScope: true,
    unrelatedOrUnsafeActionsBlocked: true,
    requiredWorkCycle: workCycle(),
    freedomRules: freedomRules(),
    blockerProtocol: blockerRule(),
    timeoutRecovery: timeoutRule(),
    durableHistoryPath: 'DEVICE-SPECIFIC .AWTSMOOS/ACTIONS/AWTSMOOS-ACTIONS.AWDB OUTSIDE THE GIT REPOSITORY',
    allCapsInstruction: text(out, next, reason)
  };
}
module.exports = { text, operatingRules, workCycle, blockerRule, timeoutRule, freedomRules };
