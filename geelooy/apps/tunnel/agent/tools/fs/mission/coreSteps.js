// B"H

function createSteps(env) {
  function nextStep(m, opts = {}) {
    const leaseState = env.Lease.touch(m, { renew: opts.renewLease !== false });
    m.heartbeatAt = env.now();
    const interruptStep = roomInterruptStep(m, leaseState);
    if (interruptStep) return interruptStep;
    const cont = env.continuation(m);
    const v = env.verify(m);
    if (!cont.continueWorking && v.ok && env.finalizeVerdict?.(m).ok) return { keepGoing: false, done: true, verdict: 'done', report: env.report(m), lease: leaseState };
    if (m.bossProtocol?.enabled && env.protocolNext) return bossProtocolStep(m, leaseState);
    if (m.selfImprovement?.policy?.enabled && env.selfImproveCourt && !env.selfImproveCourt(m).ok) return selfImproveStep(m, leaseState);
    return missionQuestionStep(m, opts, leaseState);
  }
  function roomInterruptStep(m, leaseState) {
    if (!env.roomBlockingInterrupts) return null;
    const hit = env.roomBlockingInterrupts(m)[0];
    if (!hit) return null;
    const mustCallNext = env.RoomInterrupts.mustCallNext(m, env);
    return step('room_interrupt_blocking', 'A room message interrupted the active work. Recover the interrupt before any unrelated action.', { interrupt: hit, suspendedWorkQuoted: hit.suspendedWorkQuoted, report: env.report(m), roomStatus: env.roomStatus ? env.roomStatus(m) : null, nextRequiredAction: mustCallNext, mustCallNext, responseFocus: { oneMainThing: 'Recover the blocking room interrupt before any unrelated action.', mustCallNext: true, requiredAction: 'missionRoomRecoverInterrupt', interruptId: hit.id }, lease: leaseState, allCapsPrompt: 'ROOM INTERRUPT BLOCKING: CALL missionRoomRecoverInterrupt BEFORE CONTINUING.' });
  }
  function bossProtocolStep(m, leaseState) {
    const next = env.protocolNext(m);
    const report = env.report(m);
    return step('boss_protocol_continue', 'Boss protocol is active. Execute the required protocol stage before ordinary mission work.', { report, bossProtocol: report.bossProtocol, nextRequiredAction: next, mustCallNext: next, responseFocus: { oneMainThing: 'Execute the required boss protocol stage before any unrelated action.', mustCallNext: true, requiredAction: next.action, requiredStage: next.stage, artifact: next.artifact }, lease: leaseState, allCapsPrompt: 'BOSS PROTOCOL ACTIVE: CALL missionProtocolStage FOR THE REQUIRED STAGE. DO NOT FINALIZE.' });
  }
  function selfImproveStep(m, leaseState) {
    const court = env.selfImproveCourt(m);
    const next = { action: 'missionSelfImprovePulse', missionId: m.id };
    return step('self_improvement_continue', 'Self-improvement loop is active. Run another innovation pulse before ordinary mission work.', { report: env.report(m), selfImprovement: env.selfImproveStatus(m), court, nextRequiredAction: next, mustCallNext: next, responseFocus: { oneMainThing: 'Run the next self-improvement pulse before any unrelated action.', mustCallNext: true, requiredAction: next.action }, lease: leaseState, allCapsPrompt: 'SELF IMPROVEMENT ACTIVE: CALL missionSelfImprovePulse. DO NOT FINALIZE.' });
  }
  function missionQuestionStep(m, opts, leaseState) {
    const q = env.question(m, opts.autoAdvance ? 'auto' : 'normal');
    const required = env.nextRequiredAction ? env.nextRequiredAction(m) : null;
    const response = { keepGoing: true, done: false, verdict: 'continue', messageToAgent: env.scriptText(q.script), question: q, expectedAnswerFormat: q.expectedAnswerFormat, report: env.report(m), continuationQueue: env.queueStatus ? env.queueStatus(m) : null, nextRequiredAction: required, prewrittenResponse: q.prompt, ...env.missionGateResponse(m, q), finalAnswerAllowed: false, mustContinue: true, lease: leaseState, noFinalReminder: 'missionReport is status only. Only missionFinalize may end the mission.' };
    if (opts.autoAdvance && m.automation.enabled && m.automation.cycles < m.automation.maxCycles) { m.automation.cycles += 1; response.autoSuggestedAnswer = env.autoAnswer(m, q); response.autoInstruction = 'Call missionAnswer with this answer, or override with A-E.'; }
    return response;
  }
  function step(verdict, messageToAgent, extra) { return { keepGoing: true, done: false, verdict, messageToAgent, finalAnswerAllowed: false, mustContinue: true, ...extra }; }
  return { nextStep };
}

/** B"H: The next gate now honors interrupts, boss protocol, and the long self-improvement spiral. */
module.exports = { createSteps };
