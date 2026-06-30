// B"H
const assert = require('assert');
const M = require('../tools/fs/mission/index.js');
(() => {
  const mission = M.shape({ goal: 'immortal room scheduler' }, 'mission_room_scheduler');
  const agent = M.roomJoin(mission, { roomId: 'room_forever', agentId: 'architect' });
  mission.room.agentRuntime.architect.futureQueue.push({ id: 'future_1', title: 'discover more' });
  const status = M.roomStatus(mission);
  const live = M.RoomState.live(mission, { agentId: 'architect' });
  assert.equal(agent.logicalAgentId, 'architect');
  assert(agent.processKey.includes('mission_room_scheduler'));
  assert.equal(status.scheduler.stopRule, 'explicit_verified_user_stop_only');
  assert.equal(status.nextHighestWork.kind, 'futureQueue');
  assert(status.missionGraph.nodes.some(node => node.type === 'AgentProcess'));
  assert.equal(live.continuity.ending, 'denied_without_confirmed_stop');
  assert.equal(live.commandViews.scheduler.action, 'missionRoomSchedulerStatus');
  console.log(JSON.stringify({ ok: true, suite: 'mission-room-scheduler-runtime' }, null, 2));
})();
