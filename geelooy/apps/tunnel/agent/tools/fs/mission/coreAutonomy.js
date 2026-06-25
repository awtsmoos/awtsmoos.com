// B"H

const NEWLINE = String.fromCharCode(10);

function createAutonomy(env) {
  function askHumanDecision(m, input = {}) {
    const policy = m.autonomyPolicy || env.autonomyPolicy({});
    const runtimeMs = Date.now() - Number(policy.startedAtMs || Date.now());
    const repeated = repeatedFailures(m);
    const destructive = input.destructive === true || /delete|remove|kill|reset|secret|credential/i.test(String(input.intent || input.action || ''));
    const mustAsk = !!(destructive && policy.requireHumanForDestructive) || repeated >= policy.maxRepeatedFailureBeforeHuman || (m.status === 'blocked' && runtimeMs >= policy.minRuntimeBeforeHumanQuestionMs);
    return { askHuman: mustAsk, runtimeMs, repeatedFailures: repeated, destructive, reason: mustAsk ? (destructive ? 'destructive_requires_human' : repeated >= policy.maxRepeatedFailureBeforeHuman ? 'repeated_failures' : 'blocked_after_min_runtime') : 'keep_self_working' };
  }
  function repeatedFailures(m) {
    const counts = (m.events || []).filter(e => e.type === 'failure').reduce((acc, e) => {
      const k = e.msg || 'failure';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    return Math.max(0, ...Object.values(counts));
  }
  function checkpoint(m, input = {}) {
    const c = env.counts(m);
    const cp = { id: input.id || env.id('checkpoint'), at: env.now(), kind: input.kind || 'autopilot', summary: input.summary || `Mission ${m.status}; ${c.doneTasks}/${c.totalTasks} tasks done.`, report: env.report(m), next: env.continuation(m).nextPrompt || '', mailDraftId: '' };
    m.checkpoints ||= [];
    m.checkpoints.push(cp);
    env.event(m, 'checkpoint', cp.summary, { checkpointId: cp.id });
    if ((m.autonomyPolicy || {}).allowSelfMail && input.mail !== false) cp.mailDraftId = selfMailDraft(m, { kind: 'checkpoint', checkpointId: cp.id, to: input.to || input.email || input.selfEmail || '' }).id;
    return cp;
  }
  function selfMailDraft(m, input = {}) {
    const c = env.counts(m);
    const subject = input.subject || `Mission checkpoint: ${m.goal}`.slice(0, 120);
    const lines = ['B"H', `Mission: ${m.goal}`, `Status: ${m.status}`, `Tasks: ${c.doneTasks}/${c.totalTasks} done`, `Evidence: ${c.evidence}`, `Questions: ${c.questions}`, `Answers: ${c.answers}`, `Next: ${env.continuation(m).nextPrompt || 'continue'}`, `Report: ${JSON.stringify(env.report(m))}`];
    const draft = { id: input.id || env.id('mail'), at: env.now(), kind: input.kind || 'checkpoint', to: String(input.to || input.email || ''), subject, body: input.body || lines.join(NEWLINE), status: input.to || input.email ? 'ready_to_send' : 'draft_missing_recipient' };
    m.mail ||= [];
    m.mail.push(draft);
    env.event(m, 'self_mail_draft', subject, { mailId: draft.id, status: draft.status });
    return draft;
  }
  function brainstorm(m, input = {}) {
    const policy = m.autonomyPolicy || env.autonomyPolicy({});
    const rounds = Math.min(env.num(input.rounds || input.cycles, policy.maxSelfBrainstormCycles), policy.maxSelfBrainstormCycles);
    const run = { id: input.id || env.id('brainstorm'), at: env.now(), rounds: [], stopped: '', askHuman: false };
    for (let i = 0; i < rounds; i++) if (!brainstormRound(m, input, run, i)) break;
    if (!run.stopped) run.stopped = run.rounds.length >= rounds ? 'round_limit' : 'complete';
    m.brainstorms ||= [];
    m.brainstorms.push(run);
    env.event(m, 'self_brainstorm', run.stopped, { brainstormId: run.id, rounds: run.rounds.length });
    return run;
  }
  function brainstormRound(m, input, run, i) {
    const gate = askHumanDecision(m, input);
    if (gate.askHuman) { run.stopped = gate.reason; run.askHuman = true; return false; }
    if (!env.continuation(m).continueWorking) { run.stopped = 'mission_not_continuing'; return false; }
    const q = env.question(m, 'auto');
    const answerText = input.answers?.[i] || env.autoAnswer(m, q);
    const parsed = env.parseAnswer(answerText, q);
    m.questions.push({ ...q, parsed, selfBrainstorm: true });
    const applied = env.applyChoice(m, parsed);
    const key = env.AnswerLedger.idempotencyKey({}, m, q.id, parsed);
    if (parsed.choice && applied.applied && !env.AnswerLedger.duplicate(m, q.id, key)) env.AnswerLedger.record(m, q, { ...parsed, selfBrainstorm: true }, {});
    m.automation.cycles = env.num(m.automation.cycles, 0) + 1;
    run.rounds.push({ index: i, questionId: q.id, answer: answerText, parsed, applied, verification: env.verify(m) });
    env.event(m, 'self_brainstorm_round', answerText, { brainstormId: run.id, index: i, applied });
    return true;
  }
  function autopilot(m, input = {}) {
    const policy = m.autonomyPolicy || env.autonomyPolicy({});
    m.automation.enabled = input.enabled !== false;
    m.automation.mode = 'autopilot';
    const rounds = Math.min(env.num(input.rounds || input.maxRounds, policy.maxAutopilotRounds), policy.maxAutopilotRounds);
    const out = { id: input.id || env.id('autopilot'), at: env.now(), rounds: [], checkpoints: [], mail: [], stopped: '', askHuman: false, final: null };
    for (let i = 0; i < rounds; i++) if (!autopilotRound(m, input, out, i, rounds, policy)) break;
    if (!out.stopped) out.stopped = out.rounds.length >= rounds ? 'round_limit' : 'complete';
    out.final = { report: env.report(m), verification: env.verify(m), askHuman: askHumanDecision(m, input) };
    env.event(m, 'autopilot', out.stopped, { autopilotId: out.id, rounds: out.rounds.length, askHuman: out.askHuman });
    return out;
  }
  function autopilotRound(m, input, out, i, rounds, policy) {
    const gate = askHumanDecision(m, input);
    if (gate.askHuman) { out.stopped = gate.reason; out.askHuman = true; m.escalations ||= []; m.escalations.push({ at: env.now(), reason: gate.reason, gate }); return false; }
    if (!env.continuation(m).continueWorking) { out.stopped = 'mission_not_continuing'; return false; }
    const run = brainstorm(m, { rounds: 1, answers: input.answers || [] });
    out.rounds.push(run.rounds[0] || { stopped: run.stopped });
    if ((i + 1) % Math.max(1, policy.mailEveryRounds) === 0 || input.checkpointEveryRound === true) {
      const cp = checkpoint(m, { kind: 'autopilot', summary: `Autopilot round ${i + 1}/${rounds}`, mail: input.mail !== false, to: input.to || input.email || input.selfEmail || '' });
      out.checkpoints.push(cp);
      if (cp.mailDraftId) out.mail.push(cp.mailDraftId);
    }
    return true;
  }
  return { askHumanDecision, checkpoint, selfMailDraft, brainstorm, autopilot };
}

/**
 * B"H
 * Autonomy now lives in its own garden, where loops can grow without choking
 * the core gate and parser logic.
 */
module.exports = { createAutonomy };
