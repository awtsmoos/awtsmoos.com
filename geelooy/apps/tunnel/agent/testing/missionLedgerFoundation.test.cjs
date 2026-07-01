// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const Service = require('../tools/fs/mission/ledger/service.js');
(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-mission-ledger-'));
  const config = { root, tunnelName:'test-ledger' };
  const created = await Service.create(config, { missionId:'mission_test', title:'Ledger test', projectRoot:root });
  assert.equal(created.missionId, 'mission_test');
  let m = await Service.claimLease(config, { missionId:'mission_test', agentLabel:'agent-one', focus:'verify' });
  assert.equal(m.leases.length, 1);
  m = await Service.addCheckpoint(config, { missionId:'mission_test', checkpointId:'chk_test', plainEnglish:'Run tests', evidenceRequired:['stdout'] });
  assert.equal(Service.gate(m).ok, false);
  m = await Service.recordEvidence(config, { missionId:'mission_test', checkpointId:'chk_test', kind:'command_output', claim:'tests passed', proof:{ exitCode:0 } });
  assert.equal(m.checkpoints[0].status, 'complete');
  assert.equal(Service.gate(m).ok, true);
  m = await Service.emergencyStart(config, { missionId:'mission_test', reason:'testing emergency' });
  assert.equal(Service.gate(m).ok, false);
  m = await Service.emergencyEnd(config, { missionId:'mission_test' });
  assert.equal(Service.handoff(m).missionId, 'mission_test');
  assert.equal((await Service.list(config)).length, 1);
  console.log('mission ledger foundation stores leases checkpoints evidence emergency handoff');
})().catch(error => { console.error(error); process.exit(1); });
