// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { buildActions } = require('../tools/fs/actions.js');

function action(config, payload) {
  return buildActions(config, payload, null)[payload.action]();
}

(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-room-chat-'));
  const config = { root, allowWrite: true, tools: { fsRead: true, fsWrite: true, fsBulk: true } };
  const started = await action(config, {
    action: 'missionStart',
    goal: 'multi-agent room discovery and planning',
    metadata: { projectRoot: root },
    minimumInnovationWindowMs: 0,
    expand: false
  });
  assert.strictEqual(started.ok, true);
  const missionId = started.missionId;

  const created = await action(config, { action: 'missionRoomCreate', missionId, roomName: 'General Area Planning', projectRoot: root });
  assert.strictEqual(created.room.missionId, missionId);
  assert.ok(created.room.id);

  const agentA = await action(config, {
    action: 'missionRoomJoin',
    missionId,
    projectRoot: root,
    agentId: 'agent-a',
    logicalAgentId: 'logical-a',
    agentSessionId: 'session-a',
    role: 'implementer'
  });
  const agentB = await action(config, {
    action: 'missionRoomJoin',
    missionId,
    projectRoot: root,
    agentId: 'agent-b',
    logicalAgentId: 'logical-b',
    agentSessionId: 'session-b',
    role: 'tester'
  });
  assert.strictEqual(agentA.agent.agentSessionId, 'session-a');
  assert.strictEqual(agentB.agent.agentSessionId, 'session-b');
  assert.notStrictEqual(agentA.agent.processKey, agentB.agent.processKey);

  const discovery = await action(config, { action: 'missionRoomFindActive', projectRoot: root, agentId: 'agent-c', role: 'planner' });
  assert(discovery.discovery.rooms.some(room => room.missionId === missionId), 'active room should be discoverable by project root');

  const message = await action(config, {
    action: 'missionRoomMessage',
    missionId,
    agentId: 'agent-a',
    toAgent: 'agent-b',
    interrupt: false,
    subject: 'Plan',
    message: 'I will patch mission advisory gates; please verify command isolation.'
  });
  assert.strictEqual(message.message.message.fromAgent, 'agent-a');
  assert.strictEqual(message.message.message.toAgent, 'agent-b');
  assert.strictEqual(message.message.interrupt, null);

  const status = await action(config, { action: 'missionRoomStatus', missionId });
  assert(status.roomStatus.messages.some(row => row.fromAgent === 'agent-a' && row.toAgent === 'agent-b'));
  assert.strictEqual(status.roomStatus.counts.agents, 2);

  console.log(JSON.stringify({ ok: true, suite: 'mission-room-discovery-chat', missionId, agents: status.roomStatus.counts.agents }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
