// B"H
const policy = require('./policy.js');
const ledger = require('./ledger.js');
const novelty = require('./novelty.js');
const boredom = require('./boredom.js');
const roles = require('./roles.js');
const receipts = require('./receipts.js');
const court = require('./court.js');
const pulse = require('./pulse.js');
const summit = require('./summit.js');
const bounded = require('./bounded.js');
const replay = require('./replay.js');
const handoff = require('./handoff.js');
const scheduler = require('./scheduler.js');
const schedulerResume = require('./schedulerResume.js');
const commandSuspend = require('./commandSuspend.js');
const env = { policy, ledger, novelty, boredom, roles, receipts, court, pulse, summit, bounded, replay, handoff, scheduler, schedulerResume, commandSuspend };
function start(m, input = {}) { m.selfImprovement = { policy: policy.defaults({ ...input, selfImprove: true }) }; return status(m); }
function runPulse(m, input = {}) { return pulse.run(m, input, env); }
function runSummit(m, input = {}) { return summit.run(m, input, env); }
function runBounded(m, input = {}) { return bounded.run(m, input, env); }
function runScheduler(m, input = {}) { return scheduler.run(m, input, env); }
function resumeScheduler(m, input = {}) { return schedulerResume.resume(m, input, env); }
function runReplay(m, input = {}) { return replay.build(m, input, { ...env, metadataRecords: input.metadataRecords }); }
function runHandoff(m, input = {}) { return handoff.pack(m, input, env); }
function verdict(m) { return court.verdict(m, env); }
function status(m) { return { policy: m.selfImprovement?.policy || policy.defaults({}), ledger: ledger.status(m), novelty: novelty.status(m), boredom: boredom.check(m, {}), roles: roles.status(m), receipts: receipts.status(m), summit: summit.status(m), boundedRuns: bounded.status(m), schedulerRuns: scheduler.status(m), court: verdict(m) }; }
module.exports = { start, pulse: runPulse, summit: runSummit, bounded: runBounded, scheduler: runScheduler, schedulerResume: resumeScheduler, replay: runReplay, handoff: runHandoff, verdict, status, modules: env };
