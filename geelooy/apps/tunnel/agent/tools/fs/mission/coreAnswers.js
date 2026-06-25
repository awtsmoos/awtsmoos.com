// B"H

function createAnswers(env) {
  function answerInputText(input = {}) { return env.StrictAnswer.answerInputText(input); }
  function parseAnswer(answer, q) { return env.StrictAnswer.parseAnswer(answer, q); }
  function ask(m, answer = '', mode = 'normal') {
    const q = env.question(m, mode);
    const parsed = answer ? parseAnswer(answer, q) : null;
    const key = parsed ? env.AnswerLedger.idempotencyKey({}, m, q.id, parsed) : '';
    m.questions.push({ ...q, parsed, idempotencyKey: key });
    if (parsed?.choice && !env.AnswerLedger.duplicate(m, q.id, key)) env.AnswerLedger.record(m, q, parsed, { idempotencyKey: key });
    env.event(m, 'question', q.text, { questionId: q.id, parsed, idempotencyKey: key });
    return { question: q, parsed };
  }
  function applyChoice(m, parsed) {
    const act = parsed?.choice?.action || '';
    if (!act) return env.StrictAnswer.rejectedPayload(parsed);
    if (act === 'auto') return enableAuto(m);
    if (act === 'add_task') return { applied: true, task: env.addTask(m, parsed.choice.payload.title) };
    if (act === 'complete_first_task') return completeFirst(m);
    if (act === 'evidence') return { applied: true, evidence: env.evidence(m, parsed.choice.payload) };
    if (act === 'discover') return { applied: true, discoveries: env.discover(m) };
    if (act === 'verify') return { applied: true, verification: env.verify(m) };
    if (act === 'report') return { applied: true, report: env.report(m) };
    if (act === 'done_if_ready') return doneIfReady(m);
    if (act === 'block') return block(m, parsed);
    if (act === 'attach_job') return { applied: true, message: 'Use missionAttachJob with a jobId and purpose.' };
    return { applied: false, message: 'Unknown action.' };
  }
  function enableAuto(m) { m.automation.enabled = true; m.automation.mode = 'tunnel-authored'; env.event(m, 'auto_enabled', 'Tunnel will author next questions.'); return { applied: true, auto: true, message: 'Automation enabled.' }; }
  function completeFirst(m) { const t = (m.tasks || []).find(x => x.status !== 'done'); return { applied: true, task: t ? env.completeTask(m, t.id) : null }; }
  function doneIfReady(m) { const v = env.verify(m); if (v.ok) m.status = 'done'; return { applied: true, verification: v, status: m.status }; }
  function block(m, parsed) { m.status = 'blocked'; m.blockers.push({ at: env.now(), reason: parsed.reason || 'agent selected blocker' }); return { applied: true, blocked: true }; }
  function answer(m, input = {}) {
    const q = env.question(m);
    q.id = env.AnswerLedger.questionId(input, q) || q.id;
    const parsed = parseAnswer(answerInputText(input), q);
    const key = env.AnswerLedger.idempotencyKey(input, m, q.id, parsed);
    const existing = env.AnswerLedger.duplicate(m, q.id, key);
    if (existing) return duplicateAnswer(m, parsed, key, existing, q.id);
    m.questions.push({ ...q, parsed, idempotencyKey: key });
    const applied = applyChoice(m, parsed);
    if (parsed.choice && applied.applied) env.AnswerLedger.record(m, q, parsed, { ...input, idempotencyKey: key });
    return finishAnswer(m, parsed, applied, q.id, key);
  }
  function duplicateAnswer(m, parsed, key, existing, qid) {
    const applied = env.AnswerLedger.duplicatePayload(existing);
    const next = env.nextStep(m, { autoAdvance: m.automation.enabled });
    env.event(m, 'answer_duplicate', parsed.raw, { parsed, applied, next, questionId: qid, idempotencyKey: key });
    return { parsed, applied, next };
  }
  function finishAnswer(m, parsed, applied, qid, key) {
    const next = env.nextStep(m, { autoAdvance: m.automation.enabled });
    env.event(m, parsed.choice && applied.applied ? 'answer' : 'answer_rejected', parsed.raw, { parsed, applied, next, questionId: qid, idempotencyKey: key });
    return { parsed, applied, next };
  }
  return { answerInputText, parseAnswer, ask, applyChoice, answer };
}

/**
 * B"H
 * Answer flow is now a little locked garden: parse, check duplicate, apply,
 * record through the ledger, and never let prose sneak through the fence.
 */
module.exports = { createAnswers };
