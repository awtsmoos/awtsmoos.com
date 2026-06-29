// B"H
function proposeSplit(m, input, env) {
  const room = env.RoomState.ensure(m, input);
  const by = env.RoomState.agentId(input);
  const tasks = parseTasks(input.tasks || input.splits || input.plan, env);
  const proposal = { id: input.proposalId || env.RoomState.id('room_split'), at: env.RoomState.now(), byAgent: by, title: env.RoomState.text(input.title || 'Split workload'), rationale: env.RoomState.text(input.rationale || input.reason || 'Divide work among specialized agents'), status: 'proposed', tasks, acceptedBy: [] };
  room.splitProposals.push(proposal);
  env.event(m, 'mission_room_split_proposed', proposal.title, { roomId: room.id, proposalId: proposal.id, tasks: tasks.length });
  return proposal;
}
function parseTasks(value, env) {
  if (Array.isArray(value) && value.length) return value.map((task, index) => normalizeTask(task, index, env));
  return [
    normalizeTask({ title: 'Architecture and file map', agentId: 'architect', files: ['geelooy/apps/tunnel/agent/tools/fs/mission/core.js'] }, 0, env),
    normalizeTask({ title: 'Simulator and regression tests', agentId: 'tester', files: ['geelooy/apps/tunnel/agent/tools/fs/actionGroups/test/missionRoomSimulator.test.mjs'] }, 1, env),
    normalizeTask({ title: 'Implementation and merge report', agentId: 'implementer', files: ['geelooy/apps/tunnel/agent/tools/fs/mission/roomSimulator.js'] }, 2, env)
  ];
}
function normalizeTask(task, index, env) {
  const source = typeof task === 'string' ? { title: task } : task || {};
  return { id: source.id || `split_task_${index + 1}`, title: env.RoomState.text(source.title || source.task || `Split task ${index + 1}`), agentId: env.RoomState.text(source.agentId || source.assignee || ['architect','tester','implementer'][index] || 'agent'), role: env.RoomState.text(source.role || 'worker'), files: env.RoomState.list(source.files || source.paths || source.filesToTouch), status: 'open' };
}
function acceptSplit(m, input, env) {
  const room = env.RoomState.ensure(m, input);
  const proposal = room.splitProposals.find(x => x.id === input.proposalId) || room.splitProposals.at(-1);
  if (!proposal) return null;
  const agentId = env.RoomState.agentId(input);
  proposal.acceptedBy = [...new Set([...(proposal.acceptedBy || []), agentId])];
  proposal.status = 'accepted';
  const agreement = { id: env.RoomState.id('room_agreement'), at: env.RoomState.now(), proposalId: proposal.id, agentId, status: 'accepted', note: env.RoomState.text(input.note || 'Accepted split') };
  room.agreements.push(agreement);
  env.event(m, 'mission_room_split_accepted', proposal.title, { roomId: room.id, proposalId: proposal.id, agentId });
  return { proposal, agreement };
}
function claimTask(m, input, env) {
  const room = env.RoomState.ensure(m, input);
  const agentId = env.RoomState.agentId(input);
  const taskId = env.RoomState.text(input.taskId || input.splitTaskId || input.claimTaskId);
  const proposal = room.splitProposals.find(p => (p.tasks || []).some(t => t.id === taskId)) || room.splitProposals.at(-1);
  const task = proposal ? (proposal.tasks || []).find(t => t.id === taskId || t.agentId === agentId) : null;
  const claim = { id: input.claimId || env.RoomState.id('room_claim'), at: env.RoomState.now(), agentId, taskId: task?.id || taskId || '', subMissionId: env.RoomState.text(input.subMissionId || ''), title: task?.title || env.RoomState.text(input.title || 'Claimed room task'), files: task?.files || env.RoomState.list(input.files), status: 'active' };
  room.claims.push(claim);
  if (task) task.status = 'claimed';
  if (room.agents[agentId]) room.agents[agentId].lastSeenAt = claim.at;
  env.event(m, 'mission_room_task_claimed', claim.title, { roomId: room.id, claimId: claim.id, agentId });
  return claim;
}
module.exports = { proposeSplit, acceptSplit, claimTask };
