// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { buildActions } = require('../tools/fs/actionBuilders.js');
(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awtsmoos-mission-actions-'));
  const config = { root, tunnelName:'test-actions', allowWrite:true, allowCommands:true };
  let actions = buildActions(config, { action:'missionLedgerCreate', missionId:'mission_actions', title:'Action ledger' }, null, 'test');
  let out = await actions.missionLedgerCreate();
  assert.equal(out.action, 'missionLedgerCreate');
  assert.equal(out.mission.missionId, 'mission_actions');
  actions = buildActions(config, { action:'missionCheckpointAdd', missionId:'mission_actions', checkpointId:'chk_actions', plainEnglish:'Prove actions' }, null, 'test');
  out = await actions.missionCheckpointAdd();
  assert.equal(out.mission.checkpoints.length, 1);
  actions = buildActions(config, { action:'missionHandoffGenerate', missionId:'mission_actions' }, null, 'test');
  out = await actions.missionHandoffGenerate();
  assert.equal(out.handoff.missionId, 'mission_actions');
  console.log('mission ledger actions are registered and preserve action names');
})().catch(error => { console.error(error); process.exit(1); });
