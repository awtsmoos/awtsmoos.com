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
  assert.equal(out.ok, true);
  assert.equal(out.action, name);
  return out;
}
const params = value => ({ params: JSON.stringify(value) });
async function main() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'room-interrupts-'));
  const config = { root };
  const start = await action(config, 'missionStart', params({ goal: 'interrupt test', metadata: { projectRoot: root }, minimumInnovationWindowMs: 0 }));
  const missionId = start.missionId;
  await action(config, 'missionRoomCreate', params({ missionId, projectRoot: root }));
  await action(config, 'missionRoomJoin', params({ missionId, agentId: 'agent_a' }));
  await action(config, 'missionRoomHeartbeat', params({ missionId, agentId: 'agent_a', status: 'working', currentWork: 'Agent A is inside a long code edit.' }));
  const msg = await action(config, 'missionRoomUserMessage', params({ missionId, message: 'User interrupt: pause and reconsider.', currentWork: 'Agent A is inside a long code edit.' }));
  assert.equal(msg.roomStatus.counts.blockingInterrupts, 1);
  assert(msg.interrupt.suspendedWorkQuoted.includes('> Agent A is inside'));
  const next = await action(config, 'missionNext', params({ missionId }));
  assert.equal(next.next.verdict, 'room_interrupt_blocking');
  assert.equal(next.next.mustCallNext.action, 'missionRoomRecoverInterrupt');
  const rec = await action(config, 'missionRoomRecoverInterrupt', params({ missionId, agentId: 'agent_a', interruptId: msg.interrupt.id, note: 'Recovered safely.' }));
  assert.equal(rec.recovery.ok, true);
  assert.equal(rec.roomStatus.counts.blockingInterrupts, 0);
  console.log(JSON.stringify({ ok: true, missionId, root }, null, 2));
}
main().catch(error => { console.error(error); process.exit(1); });
