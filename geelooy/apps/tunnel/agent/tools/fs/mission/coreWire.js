// B"H
const D = require('./coreDeps.js');

/**
 * B"H — Wire the palace without turning the entrance into a maze.
 * Each subsystem keeps its own vessel; this file only joins the rivers so the
 * mission can steer, continue, and remember through one stable API.
 */
function buildEnv() {
  const env = { ...D.Utils, ...pickDeps(), createRoomLoop:D.createRoomLoop };
  Object.assign(env, D.createState(env), D.createRecords(env), D.createStorage(env), D.createReports(env));
  Object.assign(env, D.createGates(env), D.createWork(env), D.createAnswers(env), D.createBossProtocol(env));
  env.BossProtocol = { defaults:env.defaults, ensure:env.ensureBossProtocol || env.ensure, start:env.start, runStage:env.runStage, answer:env.protocolAnswer, next:env.protocolNext, status:env.protocolStatus };
  env.roomLoop = D.createRoomLoop(env);
  Object.assign(env, D.createRoomEngine(env));
  wireSelfImprove(env);
  wireMissionOs(env);
  Object.assign(env, D.createFinalization(env), D.createSteps(env), D.createAutonomy(env));
  return env;
}
function pickDeps() {
  const skip = new Set(['Utils','createRoomLoop','createState','createRecords','createStorage','createReports','createGates','createWork','createAnswers','createBossProtocol','createRoomEngine','createFinalization','createSteps','createAutonomy']);
  return Object.fromEntries(Object.entries(D).filter(([key]) => !skip.has(key)));
}
function wireSelfImprove(env) {
  for (const name of ['Start','Pulse','Summit']) env[`selfImprove${name}`] = (m, input) => env.SelfImprove[name.toLowerCase()](m, input);
  env.selfImproveCourt = m => env.SelfImprove.verdict(m);
  env.selfImproveStatus = m => env.SelfImprove.status(m);
  env.selfImproveTrustScore = m => ({ score:(m.selfImproveReceipts||[]).reduce((a,r)=>a+(r.noveltyScore||0)+(r.proof?2:0),0), receipts:(m.selfImproveReceipts||[]).length, agents:Object.keys(m.room?.agents||{}).length });
}
function wireMissionOs(env) {
  const map = { Seed:'seed', Status:'status', AddNode:'addNode', UpdateNode:'updateNode', Receipt:'recordReceipt', Next:'next', ReleaseCourt:'releaseCourt', CycleCheck:'cycleCheck', Constitution:'constitution', Prompt:'prompt', KeepGoing:'keepGoing', Steer:'steer' };
  for (const [suffix, method] of Object.entries(map)) env[`missionOs${suffix}`] = (m, input) => env.MissionOS[method](m, input);
  env.roomRuntimeStatus = (m, input) => env.RoomRuntime.scheduler(env.RoomState.ensure(m, input));
}
module.exports = { buildEnv };
