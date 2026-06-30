// B"H
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const M = require('../tools/fs/mission/index.js');
const { buildMissionOperatingActions } = require('../tools/fs/actionGroups/missionOperatingActions.js');
(async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guidance-'));
  const config = { root };
  const mission = M.shape({ goal: 'plain English guidance' }, 'mission_guidance_plain');
  M.roomCreate(mission, { roomName: 'Guidance Room', projectRoot: root });
  M.roomJoin(mission, { agentId: 'scheduler' });
  await M.save(config, mission);
  const actions = buildMissionOperatingActions({ config, payload: { action:'missionRoomSchedulerStatus', missionId:mission.id } });
  const out = await actions.missionRoomSchedulerStatus();
  assert.equal(out.ok, true);
  assert.equal(out.agentGuidance.stopAllowed, false);
  assert.match(out.guidanceMessage, /mission|work|steer|useful/i);
  assert.notEqual(out.guidanceMessage, out.guidanceMessage.toUpperCase());
  assert.equal(typeof out.guidanceFacts.confidence, 'number');
  console.log(JSON.stringify({ ok: true, suite: 'mission-guidance-plain-english' }, null, 2));
})().catch(error => { console.error(error); process.exit(1); });
