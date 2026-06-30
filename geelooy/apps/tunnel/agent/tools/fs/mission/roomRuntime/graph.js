// B"H
const Work = require('./work.js');

/**
 * B"H — A small graph of the living room.
 * The Awtsmoos is not stored in the graph; the graph is only a clear window so
 * agents can see ownership, claims, and process identity without guessing.
 */
function graph(room) {
  const nodes = [{ id: room.missionId, type: 'Mission' }, { id: room.id, type: 'Room' }];
  const edges = [{ from: room.missionId, to: room.id, type: 'owns' }];
  for (const runtime of Object.values(room.agentRuntime || {})) {
    nodes.push({ id: runtime.processKey, type: 'AgentProcess', label: runtime.logicalAgentId });
    edges.push({ from: room.id, to: runtime.processKey, type: 'schedules' });
  }
  for (const claim of Work.activeClaims(room)) {
    nodes.push({ id: claim.id, type: 'Claim', label: claim.title });
    edges.push({ from: claim.agentId || room.id, to: claim.id, type: 'executes' });
  }
  return { nodes, edges };
}
module.exports = { graph };
