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
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'boss-report-'));
  const config = { root };
  const started = await action(config, 'missionStart', params({
    goal: 'boss protocol report visibility',
    bossProtocol: true,
    minimumInnovationWindowMs: 0,
    minimumProductiveCycles: 0,
    minimumProductiveMs: 0
  }));
  const missionId = started.missionId;
  const report = await action(config, 'missionReport', params({ missionId }));
  assert.equal(report.reportIsFinal, false);
  assert.equal(report.finalizationAction, 'missionFinalize');
  assert.equal(report.report.bossProtocol.enabled, true);
  assert.equal(report.report.bossProtocol.finalizationReady, false);
  assert.equal(report.report.bossProtocol.nextRequiredAction.action, 'missionProtocolStage');
  assert.equal(report.report.continuation.reason, 'boss_protocol_not_complete');
  const next = await action(config, 'missionNext', params({ missionId }));
  assert.equal(next.nextRequiredAction.action, 'missionProtocolStage');
  assert.equal(next.nextRequiredAction.stage, 'WILD_BRAINSTORM');
  assert.equal(next.next.mustCallNext.action, 'missionProtocolStage');
  assert.equal(next.next.verdict, 'boss_protocol_continue');
  assert.equal(next.next.responseFocus.requiredStage, 'WILD_BRAINSTORM');
  console.log(JSON.stringify({ ok: true, missionId, root }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
