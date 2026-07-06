// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const Stream = require('../lib/runtime/action-stream.js');
const Priority = require('../lib/runtime/priority.js');
const { buildActions } = require('../tools/fs/actions.js');

async function waitForEvents(config, count) {
  for (let i = 0; i < 20; i++) {
    const page = Stream.list(config, { limit: 100 });
    if (page.events.length >= count) return page;
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  return Stream.list(config, { limit: 100 });
}

(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-action-stream-root-'));
  const state = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-action-stream-state-'));
  const config = { root, deviceStateRoot: state, tunnelName: 'stream-test' };

  Stream.emit(config, {
    phase: 'action.received',
    lane: 'p1_fs_light',
    payload: {
      action: 'read',
      kind: 'fs',
      missionId: 'mission-a',
      roomId: 'room-a',
      logicalAgentId: 'agent-a',
      agentSessionId: 'session-a',
      conversationId: 'conversation-a',
      controlRequestId: 'ctrl-a',
      clientRequestId: 'client-a'
    }
  });
  Stream.emit(config, {
    phase: 'action.completed',
    lane: 'p1_fs_light',
    payload: {
      action: 'read',
      kind: 'fs',
      missionId: 'mission-a',
      roomId: 'room-a',
      logicalAgentId: 'agent-a',
      agentSessionId: 'session-a',
      conversationId: 'conversation-a'
    },
    result: { ok: true, action: 'read', actionId: 'act-a', outputRef: 'awdb://act-a:output' }
  });
  Stream.emit(config, {
    phase: 'action.completed',
    lane: 'p3_heavy',
    payload: { action: 'chromeNavigate', kind: 'chrome', missionId: 'mission-b', roomId: 'room-b', logicalAgentId: 'agent-b' },
    result: { ok: false, status: 504, error: 'timeout' }
  });

  const all = await waitForEvents(config, 3);
  assert.equal(all.events.length, 3);
  assert.equal(all.events[0].phase, 'action.received');
  assert.equal(all.events[1].actionId, 'act-a');
  assert.equal(all.events[2].kind, 'chrome');

  const afterFirst = Stream.list(config, { cursor: all.events[0].eventId, limit: 10 });
  assert.equal(afterFirst.events.length, 2);
  assert.equal(afterFirst.events[0].phase, 'action.completed');

  const room = Stream.list(config, { roomId: 'room-a', limit: 10 });
  assert.equal(room.events.length, 2);
  assert.ok(room.events.every(event => event.roomId === 'room-a'));

  const browserAction = await buildActions(config, { action: 'browserActionStream', limit: 10 }, null).browserActionStream();
  assert.equal(browserAction.ok, true);
  assert.equal(browserAction.count, 1);
  assert.equal(browserAction.events[0].action, 'chromeNavigate');

  const agentAction = await buildActions(config, { action: 'agentActionStream', logicalAgentId: 'agent-a', limit: 10 }, null).agentActionStream();
  assert.equal(agentAction.count, 2);
  assert.ok(agentAction.events.every(event => event.logicalAgentId === 'agent-a'));

  assert.equal(Priority.laneForAction('actionStream', 'fs'), Priority.LANES.P0);
  assert.equal(Priority.laneForAction('roomActionStream', 'fs'), Priority.LANES.P0);

  console.log(JSON.stringify({ ok: true, suite: 'action-stream-runtime', events: all.events.length }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
