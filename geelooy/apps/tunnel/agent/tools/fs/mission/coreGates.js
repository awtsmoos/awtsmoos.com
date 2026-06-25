// B"H

function createGates(env) {
  function scriptFor(m) {
    const c = env.counts(m);
    if (c.totalTasks === 0) return 'AFTER_START';
    if (c.openTasks > 0 && c.evidence === 0) return 'AFTER_TASK_NO_EVIDENCE';
    if (c.openTasks > 0) return 'AFTER_PARTIAL';
    if (c.evidence > 0 && !env.dod(m).ok) return 'AFTER_EVIDENCE';
    if (env.dod(m).ok && m.status !== 'done') return 'BEFORE_DONE';
    return 'KEEP_GOING';
  }
  function scriptText(name) {
    return ({ AFTER_START: 'Create the first concrete task. Do not ask the user unless impossible.', AFTER_TASK_NO_EVIDENCE: 'There is an open task with no proof. Execute or verify it next.', AFTER_PARTIAL: 'Some work is open. Finish an open task or attach a long job.', AFTER_EVIDENCE: 'Evidence exists but completion gates still fail. Add missing proof, tasks, or questions.', BEFORE_DONE: 'Completion gates look satisfied. Run final critic/verifier before reporting done.', KEEP_GOING: 'Continue until the mission is actually done.' })[name] || 'Continue.';
  }
  function choice(key, text, action, payload = {}) { return { key, text, action, payload }; }
  function question(m, mode = 'normal') {
    const c = env.counts(m), script = scriptFor(m);
    const choices = c.totalTasks === 0 ? startChoices() : c.openTasks > 0 ? openChoices() : doneChoices();
    return { id: env.id('q'), at: env.now(), script, prompt: scriptText(script), text: mode === 'auto' ? 'Tunnel-selected next move: choose or allow auto-advance.' : 'What should happen next?', choices, answerMode: 'single_letter_choice', strictAnswer: true, expectedAnswerFormat: 'ONE EXACT LETTER: A, B, C, D, or E. No prose. No reason.' };
  }
  function startChoices() { return [choice('A', 'Create implementation task', 'add_task', { title: 'implement next concrete step' }), choice('B', 'Create verification task', 'add_task', { title: 'verify behavior' }), choice('C', 'Record blocker', 'block', {}), choice('D', 'Let tunnel choose next question forever', 'auto', {}), choice('E', 'Show mission report', 'report', {})]; }
  function openChoices() { return [choice('A', 'Finish first open task', 'complete_first_task', {}), choice('B', 'Attach or poll long-running job', 'attach_job', {}), choice('C', 'Record verification evidence', 'evidence', { claim: 'verification passed' }), choice('D', 'Let tunnel choose next question forever', 'auto', {}), choice('E', 'Run discovery pass', 'discover', {})]; }
  function doneChoices() { return [choice('A', 'Run completion court', 'verify', {}), choice('B', 'Add stress-test evidence', 'evidence', { claim: 'verification passed stress coverage' }), choice('C', 'Reopen a missing task', 'add_task', { title: 'address discovered gap' }), choice('D', 'Let tunnel choose next question forever', 'auto', {}), choice('E', 'Mark done only if gates pass', 'done_if_ready', {})]; }
  function autoAnswer(m) {
    const c = env.counts(m);
    if (c.totalTasks === 0) return 'A';
    if (c.openTasks > 0 && c.evidence === 0) return 'C';
    if (c.openTasks > 0) return 'A';
    if (!env.verify(m).ok) return 'A';
    return 'E';
  }
  function missionGateResponse(m, q, extra = {}) {
    const answer = autoAnswer(m, q);
    const innovationGate = env.Innovation.gate(m);
    const idempotencyKey = env.AnswerLedger.idempotencyKey({}, m, q.id, { key: answer });
    return { multipleChoiceSelfInterrogation: interrogation(q, answer), responseFocus: focus(q, answer, innovationGate), ...innovationGate, mustCallNext: extra.mustCallNext || { action: 'missionAnswer', missionId: m.id, questionId: q.id, multipleChoiceAnswer: answer, idempotencyKey }, finalAnswerAllowed: false, mustContinue: true, allCapsPrompt: 'ANSWER THE MISSION GATE WITH ONE EXACT LETTER, THEN CONTINUE THE PLAN WITH PROOF.' };
  }
  function interrogation(q, answer) { return { questionId: q.id, prompt: q.prompt, text: q.text, choices: q.choices, expectedAnswerFormat: q.expectedAnswerFormat, answerMode: q.answerMode, strictAnswer: q.strictAnswer, recommendedAnswer: answer }; }
  function focus(q, answer, gate) { return { oneMainThing: 'Answer the mission multiple-choice gate before any unrelated action.', mustAnswerGate: true, expectedAnswerFormat: q.expectedAnswerFormat, answerMode: q.answerMode, strictAnswer: q.strictAnswer, recommendedAnswer: answer, innovationContinuation: gate.innovationContinuation }; }
  return { scriptFor, scriptText, choice, question, autoAnswer, missionGateResponse };
}

/**
 * B"H
 * Gates are cute and strict: soft labels outside, one exact letter inside.
 */
module.exports = { createGates };
