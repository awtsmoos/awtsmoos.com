// B"H
async function createSubMissions(config, m, input, env) {
  const room = env.RoomState.ensure(m, input);
  const proposal = room.splitProposals.find(x => x.id === input.proposalId) || room.splitProposals.at(-1);
  if (!proposal) return { ok: false, error: 'no_split_proposal', subMissions: [] };
  proposal.status = 'accepted';
  const made = [];
  for (const task of proposal.tasks || []) {
    const child = await env.create(config, { goal: `${m.goal} :: ${task.title}`, bossProtocol: true, minimumProtocolCycles: input.minimumProtocolCycles ?? 1, minimumInnovationWindowMs: input.minimumInnovationWindowMs ?? 0, minimumProductiveCycles: input.minimumProductiveCycles ?? 0, minimumProductiveMs: input.minimumProductiveMs ?? 0, metadata: { parentMissionId: m.id, roomId: room.id, assignedAgentId: task.agentId, splitTaskId: task.id, files: task.files } });
    const record = { id: env.RoomState.id('room_sub'), at: env.RoomState.now(), missionId: child.id, parentMissionId: m.id, roomId: room.id, agentId: task.agentId, taskId: task.id, title: task.title, status: 'active', bossProtocol: true, files: task.files };
    room.subMissions.push(record);
    if (room.agents[task.agentId]) room.agents[task.agentId].subMissionIds = [...new Set([...(room.agents[task.agentId].subMissionIds || []), child.id])];
    made.push(record);
  }
  env.event(m, 'mission_room_sub_missions_created', `${made.length} sub-missions created`, { roomId: room.id, proposalId: proposal.id });
  return { ok: true, proposalId: proposal.id, subMissions: made };
}
function mergeReports(m, input, env) {
  const room = env.RoomState.ensure(m, input);
  const report = { id: env.RoomState.id('room_merge'), at: env.RoomState.now(), summary: env.RoomState.text(input.summary || 'Merged room reports'), subMissions: room.subMissions.map(x => ({ missionId: x.missionId, agentId: x.agentId, title: x.title, status: x.status })), messages: room.messages.slice(-10), claims: room.claims.slice(-10), remainingDebt: env.RoomState.list(input.remainingDebt || room.subMissions.filter(x => x.status !== 'done').map(x => x.title)) };
  room.mergeReports.push(report);
  env.event(m, 'mission_room_merge_reports', report.summary, { roomId: room.id, mergeId: report.id });
  return report;
}
module.exports = { createSubMissions, mergeReports };
