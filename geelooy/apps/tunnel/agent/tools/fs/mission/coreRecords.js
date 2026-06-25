// B"H

function createRecords(env) {
  function event(m, type, msg, data = {}) {
    m.events ||= [];
    m.events.push({ at: env.now(), type, msg, data });
    m.updatedAt = env.now();
    return m;
  }
  function addTask(m, title, extra = {}) {
    const t = { id: extra.id || env.id('task'), title: String(title || extra.title || 'task'), status: extra.status || 'open', createdAt: env.now(), evidence: [] };
    m.tasks.push(t);
    event(m, 'task_added', t.title, { taskId: t.id });
    return t;
  }
  function completeTask(m, tid, eid = '') {
    const t = m.tasks.find(x => x.id === tid || x.title === tid);
    if (!t) return null;
    t.status = 'done';
    t.completedAt = env.now();
    if (eid) t.evidence.push(eid);
    event(m, 'task_completed', t.title, { taskId: t.id });
    return t;
  }
  function evidence(m, input = {}) {
    const e = { id: input.id || env.id('evidence'), kind: input.kind || 'note', claim: String(input.claim || input.message || input.text || input.query || ''), proof: input.proof || input.output || input.data || null, ok: input.ok !== false, at: env.now() };
    m.evidence.push(e);
    event(m, 'evidence', e.claim, { evidenceId: e.id });
    return e;
  }
  function counts(m) {
    const tasks = m.tasks || [];
    return { totalTasks: tasks.length, doneTasks: tasks.filter(t => t.status === 'done').length, openTasks: tasks.filter(t => t.status !== 'done').length, evidence: (m.evidence || []).length, blockers: (m.blockers || []).length, questions: (m.questions || []).length, answers: (m.answers || []).length, jobs: (m.jobs || []).length };
  }
  function dod(m) {
    const c = counts(m);
    const text = JSON.stringify(m.evidence || []).toLowerCase();
    const checks = (m.definitionOfDone || []).map(name => ({ name, ok: text.includes(String(name).toLowerCase()) || text.includes('verification passed') }));
    const ok = c.openTasks === 0 && c.totalTasks > 0 && c.evidence > 0 && c.blockers === 0 && checks.every(x => x.ok || /evidence|verification|supervisor/i.test(x.name));
    return { ok, counts: c, checks };
  }
  return { event, addTask, completeTask, evidence, counts, dod };
}

/**
 * B"H
 * Records are footprints in wet light. Tasks, evidence, and counts live here,
 * away from the gate parser, so proof and choice no longer blur together.
 */
module.exports = { createRecords };
