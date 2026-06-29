// B"H
import { createRequire } from 'module';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import assert from 'assert/strict';
const require = createRequire(import.meta.url);
const { buildMissionActions } = require('../missionActions.js');
async function action(config, name, payload = {}) {
  const actions = buildMissionActions({ config, payload: { action: name, ...payload } });
  const out = await actions[name]();
  assert.equal(out.ok, true, `${name} ok`);
  assert.equal(out.action, name, `${name} action`);
  return out;
}
const params = value => ({ params: JSON.stringify(value) });
async function main() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'room-real-chat-'));
  const config = { root };
  const start = await action(config, 'missionStart', params({ goal: 'real chat room sim', metadata: { projectRoot: root }, minimumInnovationWindowMs: 0 }));
  const missionId = start.missionId;
  await action(config, 'missionRoomCreate', params({ missionId, projectRoot: root, roomName: 'Active Advice Room' }));
  const found = await action(config, 'missionRoomFindActive', params({ projectRoot: root, agentId: 'agent_b' }));
  assert(found.discovery.count >= 1);
  assert.equal(found.discovery.mustCallNext.action, 'missionRoomJoin');
  assert.equal(found.discovery.mustCallNext.missionId, missionId);
  const sim = await action(config, 'missionRoomRealChatSimulate', params({ missionId, projectRoot: root, minimumProtocolCycles: 1 }));
  assert.equal(sim.simulation.ok, true);
  assert.equal(sim.simulation.blockedAfterB, 1);
  assert.equal(sim.simulation.recoveredB.ok, true);
  assert.equal(sim.simulation.blockedAfterUser, 1);
  assert.equal(sim.simulation.recoveredUser.ok, true);
  assert(sim.simulation.bMessage.interrupt.suspendedWorkQuoted.startsWith('>'));
  assert(sim.simulation.userMessage.interrupt.suspendedWorkQuoted.startsWith('>'));
  assert.equal(sim.simulation.subMissions.length, 3);
  assert.equal(sim.roomStatus.counts.blockingInterrupts, 0);
  assert(sim.roomStatus.brainstorms.length >= 2);
  console.log(JSON.stringify({ ok: true, missionId, root }, null, 2));
}
main().catch(error => { console.error(error); process.exit(1); });
