// B"H

function createWork(env) {
  function discover(m) {
    const names = ['unfinished_work', 'hidden_bugs', 'verification_gap', 'performance', 'documentation', 'future_evolution'];
    const text = JSON.stringify(m.evidence || []).toLowerCase();
    const discoveries = names.map(name => ({ name, ok: text.includes(name) || text.includes('verification'), recommendation: text.includes(name) ? 'covered' : 'inspect_' + name }));
    m.discoveries.push({ at: env.now(), discoveries });
    env.event(m, 'discovery', 'Discovery pass completed');
    return discoveries;
  }
  function attachJob(m, input = {}) {
    const job = { id: input.jobId || input.id || env.id('job'), purpose: input.purpose || input.goal || 'long-running work', status: input.status || 'attached', expectedSignal: input.expectedSignal || '', timeoutMs: Number(input.timeoutMs || 7200000), attachedAt: env.now(), lastPollAt: null };
    m.jobs.push(job);
    env.event(m, 'job_attached', job.purpose, { jobId: job.id });
    return job;
  }
  function heartbeat(m, input = {}) {
    m.heartbeatAt = env.now();
    if (input.note) env.event(m, 'heartbeat', input.note);
    return { at: m.heartbeatAt, keepGoing: env.continuation(m).continueWorking, next: env.nextStep(m, { autoAdvance: m.automation.enabled }) };
  }
  return { discover, attachJob, heartbeat };
}

/**
 * B"H
 * Work is movement: discover, attach long jobs, and beat the heart again.
 */
module.exports = { createWork };
