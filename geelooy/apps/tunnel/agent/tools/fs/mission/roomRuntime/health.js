// B"H
const Work = require('./work.js');
const Graph = require('./graph.js');

/**
 * B"H — Health is a compass, not a verdict.
 * It tells the room what to inspect next and gently reminds the agent that a
 * quiet queue means discovery should begin, not that the mission should stop.
 */
function health(room) {
  const agents = Object.values(room.agentRuntime || {});
  const stale = agents.filter(a => Date.now() - Date.parse(a.heartbeat || 0) > 15 * 60 * 1000);
  return {
    architectureScore: 100 - Math.min(40, Work.activeClaims(room).length * 2),
    staleAgents: stale.map(a => a.logicalAgentId),
    openInterrupts: (room.interrupts || []).filter(x => x.status === 'blocking').length,
    activeClaims: Work.activeClaims(room).length,
    nextHighestWork: Work.nextHighestWork(room)
  };
}
function scheduler(room) {
  return {
    defaultLoop: ['discover','plan','claim','execute','verify','review','self critique','refactor','look for more'],
    guidance: 'You may steer toward higher-value unfinished work. Do not stop this mission merely because one command finished.',
    stopRule: 'explicit_verified_user_stop_only', agents: Object.values(room.agentRuntime || {}),
    health: health(room), missionGraph: Graph.graph(room)
  };
}
module.exports = { health, scheduler };
