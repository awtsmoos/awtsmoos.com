// B"H
async function simulate(config, m, input, env) {
  const room = env.roomCreate(m, { roomName: input.roomName || 'Simulated Agent Room', projectRoot: input.projectRoot || config.root });
  const agents = joinThree(m, env);
  env.roomMessage(m, { agentId: 'architect', subject: 'Initial scan', message: 'I will map files and split risk.', interrupt: false });
  env.roomMessage(m, { agentId: 'tester', subject: 'Test lane', message: 'I will own simulator and regression proof.', interrupt: false });
  env.roomMessage(m, { agentId: 'implementer', subject: 'Implementation lane', message: 'I will wire actions and merge reports.', interrupt: false });
  const discovery = env.roomDiscoverAgents(m, input);
  const proposal = env.roomProposeSplit(m, { agentId: 'architect', title: 'Three-agent boss split' });
  for (const agent of agents) env.roomAcceptSplit(m, { agentId: agent.agentId, proposalId: proposal.id });
  const sub = await env.roomCreateSubMissions(config, m, { proposalId: proposal.id, minimumProtocolCycles: input.minimumProtocolCycles ?? 1 });
  for (const item of sub.subMissions || []) env.roomClaimTask(m, { agentId: item.agentId, taskId: item.taskId, subMissionId: item.missionId });
  for (const agent of agents) env.roomHeartbeat(m, { agentId: agent.agentId, status: 'working', note: 'sub-mission claimed' });
  const merge = env.roomMergeReports(m, { summary: 'Three agents split the workload and created boss-protocol sub-missions.' });
  return { ok: true, room, agents, discovery, proposal, subMissions: sub.subMissions, merge, status: env.roomStatus(m) };
}
async function realChatSimulate(config, m, input, env) {
  const root = input.projectRoot || config.root;
  env.roomCreate(m, { roomName: 'Real ChatGPT Room Simulation', projectRoot: root });
  const agentA = env.roomJoin(m, { agentId: 'agent_a', role: 'initial worker', capabilities: ['implementation','boss protocol'] });
  const brainstormA = env.roomBrainstorm(m, { agentId: 'agent_a', count: 12, prompt: 'Brainstorm before beginning active work' });
  env.roomHeartbeat(m, { agentId: 'agent_a', status: 'working', currentWork: 'Agent A is rewriting room interrupt support and preparing tests.' });
  const discovery = env.RoomDiscovery.around(await env.all(config), { projectRoot: root, agentId: 'agent_b', role: 'room finder' }, env);
  const agentB = env.roomJoin(m, { agentId: 'agent_b', role: 'room finder', capabilities: ['discover active room','interrupt safely'] });
  const brainstormB = env.roomBrainstorm(m, { agentId: 'agent_b', count: 12, prompt: 'Brainstorm how to join the right active room without disrupting incorrectly' });
  const bMessage = env.roomMessage(m, { agentId: 'agent_b', toAgent: 'agent_a', subject: 'Found your room', message: 'I found the active room around this directory. I can split tests while you continue implementation.', currentWork: 'Agent A is mid-implementation and must not lose context.' });
  const blockedAfterB = env.roomStatus(m).blockingInterrupts.length;
  const recoveredB = env.roomRecoverInterrupt(m, { agentId: 'agent_a', interruptId: bMessage.interrupt.id, note: 'Agent A read Agent B message and preserved suspended work before continuing.' });
  const userMessage = env.roomUserMessage(m, { message: 'User says: brainstorm first, then split the workload and keep me informed.', currentWork: 'Agent A and Agent B were negotiating split tasks.' });
  const blockedAfterUser = env.roomStatus(m).blockingInterrupts.length;
  const recoveredUser = env.roomRecoverInterrupt(m, { agentId: 'agent_b', interruptId: userMessage.interrupt.id, note: 'Agent B acknowledged user instruction and will route it into the split plan.' });
  const proposal = env.roomProposeSplit(m, { agentId: 'agent_b', title: 'Real chat split after interrupts' });
  env.roomAcceptSplit(m, { agentId: 'agent_a', proposalId: proposal.id });
  env.roomAcceptSplit(m, { agentId: 'agent_b', proposalId: proposal.id });
  const sub = await env.roomCreateSubMissions(config, m, { proposalId: proposal.id, minimumProtocolCycles: 1 });
  const merge = env.roomMergeReports(m, { summary: 'Real-chat simulation recovered interrupts and created boss-protocol sub-missions.' });
  return { ok: true, agentA, agentB, brainstormA, brainstormB, discovery, bMessage, blockedAfterB, recoveredB, userMessage, blockedAfterUser, recoveredUser, proposal, subMissions: sub.subMissions, merge, status: env.roomStatus(m) };
}
function joinThree(m, env) {
  return [
    env.roomJoin(m, { agentId: 'architect', role: 'Architecture splitter', capabilities: ['file map','risk'] }),
    env.roomJoin(m, { agentId: 'tester', role: 'Verification keeper', capabilities: ['tests','simulation'] }),
    env.roomJoin(m, { agentId: 'implementer', role: 'Implementation worker', capabilities: ['code','merge'] })
  ];
}
module.exports = { simulate, realChatSimulate };
