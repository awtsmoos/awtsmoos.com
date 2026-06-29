// B"H
function status(m, env) {
  const room = env.RoomState.ensure(m);
  const latest = room.splitProposals.at(-1) || null;
  return { latestProposal: latest, agreements: room.agreements, accepted: !!latest && latest.status === 'accepted', missingAgents: latest ? (latest.tasks || []).map(t => t.agentId).filter(id => !(latest.acceptedBy || []).includes(id)) : [] };
}
module.exports = { status };
