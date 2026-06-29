// B"H
import { createRequire } from 'module';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import assert from 'assert/strict';
const require = createRequire(import.meta.url);
const { buildMissionActions } = require('../missionActions.js');
async function call(config, invokedAction, payload = {}, spoof = 'spoofedWrongAction') {
  const actions = buildMissionActions({ config, payload: { action: spoof, ...payload } });
  const out = await actions[invokedAction]();
  assert.equal(out.ok, true, `${invokedAction} ok`);
  assert.equal(out.action, invokedAction, `${invokedAction} must not echo spoofed payload.action`);
  assert.notEqual(out.action, spoof, `${invokedAction} must not be spoofed`);
  return out;
}
const params = value => ({ params: JSON.stringify(value) });
async function main() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'action-mismatch-'));
  const config = { root, metadataRoot: path.join(root, '.meta') };
  const start = await call(config, 'missionStart', params({ goal: 'action mismatch concurrency', minimumInnovationWindowMs: 0 }), 'missionRoomMessage');
  const missionId = start.missionId;
  await call(config, 'missionRoomCreate', params({ missionId, projectRoot: root, roomName: 'Mismatch Room' }), 'missionRoomRecoverInterrupt');
  await call(config, 'missionRoomJoin', params({ missionId, agentId: 'agent_a' }), 'missionRoomClaimFile');
  await call(config, 'missionRoomJoin', params({ missionId, agentId: 'agent_b' }), 'missionRoomReleaseFile');
  const concurrent = await Promise.all([
    call(config, 'missionRoomMessage', params({ missionId, agentId: 'agent_a', message: 'A says hello', interrupt: false }), 'missionRoomClaimFile'),
    call(config, 'missionRoomClaimFile', params({ missionId, agentId: 'agent_a', file: 'a.js' }), 'missionRoomMessage'),
    call(config, 'missionRoomClaimFile', params({ missionId, agentId: 'agent_b', file: 'b.js' }), 'missionRoomRecoverInterrupt'),
    call(config, 'missionRoomBrainstorm', params({ missionId, agentId: 'agent_b', count: 10 }), 'missionRoomUserMessage'),
    call(config, 'missionRoomLoopPulse', params({ missionId, agentId: 'agent_a' }), 'missionRoomMergeCourt')
  ]);
  assert.deepEqual(concurrent.map(x => x.action).sort(), ['missionRoomBrainstorm','missionRoomClaimFile','missionRoomClaimFile','missionRoomLoopPulse','missionRoomMessage'].sort());
  const userMsg = await call(config, 'missionRoomUserMessage', params({ missionId, message: 'interrupt me', currentWork: 'agent work' }), 'missionRoomClaimFile');
  assert.equal(userMsg.action, 'missionRoomUserMessage');
  assert(userMsg.interrupt.id);
  const rec = await call(config, 'missionRoomRecoverInterrupt', params({ missionId, agentId: 'agent_a', interruptId: userMsg.interrupt.id }), 'missionRoomMessage');
  assert.equal(rec.action, 'missionRoomRecoverInterrupt');
  assert.equal(rec.recovery.ok, true);
  const status = await call(config, 'missionRoomStatus', params({ missionId }), 'missionRoomRecoverInterrupt');
  assert.equal(status.roomStatus.counts.blockingInterrupts, 0);
  console.log(JSON.stringify({ ok: true, missionId, root, actions: concurrent.map(x => x.action) }, null, 2));
}
main().catch(error => { console.error(error); process.exit(1); });
