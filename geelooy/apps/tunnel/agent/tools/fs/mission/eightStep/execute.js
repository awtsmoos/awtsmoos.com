// B"H
const Store = require('./store.js');
const Work = require('../workQueue/index.js');
function instructions(step = {}) {
  const base = ['Do this step as real project work, record evidence, then review the step when useful.'];
  if (step.kind === 'write') base.unshift('WRITE COMPLETE FILES ONLY. DO NOT PARTIALLY PATCH FILES.');
  if (step.kind === 'verify') base.unshift('RUN LIVE TUNNEL VERIFICATION OR COMMAND OUTPUT AND RECORD THE RESULT.');
  if (step.kind === 'read') base.unshift('READ REAL FILES OR REAL TUNNEL STATE BEFORE CLAIMING ANYTHING.');
  return base;
}
function run(m, input = {}) {
  const round = Store.current(m), step = Store.byIndex(round, input.stepIndex);
  if (!round || !step) return advisory({ error: 'next8_step_not_found', round, step });
  step.status = 'running';
  step.updatedAt = new Date().toISOString();
  const q = Work.ensure(m);
  const work = q.items.find(x => x.key === step.workKey) || null;
  if (work && work.status === 'pending') work.status = 'in_progress';
  round.workQueueProgress = Work.summary(m);
  return advisory({
    roundId: round.id,
    step,
    workItem: work,
    liveActionToPerform: step.liveAction || work?.payload || null,
    fileWorkRequired: ['read','write','verify','inspect'].includes(step.kind),
    instructions: instructions(step),
    nextSuggestedToolCall: { action: 'missionReviewNext8Step', missionId: m.id, roundId: round.id, stepIndex: step.index }
  });
}
function advisory(out = {}) {
  return { ...out, finalAnswerAllowed:true, mustContinue:false, userVisibleAnswerBlocked:false };
}
module.exports = { run, instructions, advisory };
