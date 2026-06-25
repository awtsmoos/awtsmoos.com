// B"H

function createSteps(env) {
  function nextStep(m, opts = {}) {
    const leaseState = env.Lease.touch(m, { renew: opts.renewLease !== false });
    m.heartbeatAt = env.now();
    const cont = env.continuation(m);
    const v = env.verify(m);
    if (!cont.continueWorking && v.ok) {
      return { keepGoing: false, done: true, verdict: 'done', report: env.report(m), lease: leaseState };
    }
    const q = env.question(m, opts.autoAdvance ? 'auto' : 'normal');
    const response = { keepGoing: true, done: false, verdict: 'continue', messageToAgent: env.scriptText(q.script), question: q, expectedAnswerFormat: q.expectedAnswerFormat, report: env.report(m), prewrittenResponse: q.prompt, ...env.missionGateResponse(m, q) };
    if (opts.autoAdvance && m.automation.enabled && m.automation.cycles < m.automation.maxCycles) {
      m.automation.cycles += 1;
      response.autoSuggestedAnswer = env.autoAnswer(m, q);
      response.autoInstruction = 'Call missionAnswer with this answer, or override with A-E.';
    }
    return response;
  }
  return { nextStep };
}

/**
 * B"H
 * The next step is a small doorway, not the whole palace.
 */
module.exports = { createSteps };
