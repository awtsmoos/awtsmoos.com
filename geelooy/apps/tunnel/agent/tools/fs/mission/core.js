// B"H
const Lease = require('./lease.js');
const Constitution = require('./constitution.js');
const StrictAnswer = require('./strictAnswer.js');
const Innovation = require('./innovationPolicy.js');
const AnswerLedger = require('./answerLedger.js');
const Utils = require('./coreUtils.js');
const { createState } = require('./coreState.js');
const { createRecords } = require('./coreRecords.js');
const { createStorage } = require('./coreStorage.js');
const { createReports } = require('./coreReports.js');
const { createGates } = require('./coreGates.js');
const { createWork } = require('./coreWork.js');
const { createAnswers } = require('./coreAnswers.js');
const { createSteps } = require('./coreSteps.js');
const { createAutonomy } = require('./coreAutonomy.js');

/**
 * B"H
 * Chapter 548: The giant palace became rooms with windows.
 * Core now assembles small vessels: utils, state, storage, records, reports,
 * gates, work, answers, steps, and autonomy. The public API stays whole; the
 * internals stop shouting over each other.
 */
const env = { ...Utils, Lease, Constitution, StrictAnswer, Innovation, AnswerLedger };
Object.assign(env, createState(env));
Object.assign(env, createRecords(env));
Object.assign(env, createStorage(env));
Object.assign(env, createReports(env));
Object.assign(env, createGates(env));
Object.assign(env, createWork(env));
Object.assign(env, createAnswers(env));
Object.assign(env, createSteps(env));
Object.assign(env, createAutonomy(env));

module.exports = {
  DIR: env.DIR, id: env.id, clean: env.clean, dir: env.dir, file: env.file,
  ensure: env.ensure, create: env.create, load: env.load, save: env.save, all: env.all,
  shape: env.shape, event: env.event, addTask: env.addTask, completeTask: env.completeTask,
  evidence: env.evidence, counts: env.counts, dod: env.dod, continuation: env.continuation,
  scriptFor: env.scriptFor, scriptText: env.scriptText, question: env.question,
  answerInputText: env.answerInputText, parseAnswer: env.parseAnswer, ask: env.ask,
  applyChoice: env.applyChoice, answer: env.answer, nextStep: env.nextStep,
  missionGateResponse: env.missionGateResponse, autoAnswer: env.autoAnswer,
  discover: env.discover, attachJob: env.attachJob, heartbeat: env.heartbeat,
  verify: env.verify, supervise: env.supervise, report: env.report,
  timeline: env.timeline, graph: env.graph, autonomyPolicy: env.autonomyPolicy,
  askHumanDecision: env.askHumanDecision, checkpoint: env.checkpoint,
  selfMailDraft: env.selfMailDraft, brainstorm: env.brainstorm, autopilot: env.autopilot,
  Lease, Constitution, StrictAnswer, Innovation, AnswerLedger
};
