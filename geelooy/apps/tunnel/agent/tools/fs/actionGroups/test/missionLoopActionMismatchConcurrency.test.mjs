// B"H
import { createRequire } from 'module';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import assert from 'assert/strict';
const require = createRequire(import.meta.url);
const { buildMissionActions } = require('../missionActions.js');
async function call(config, invokedAction, payload = {}, spoof = 'wrongAction') { const out = await buildMissionActions({ config, payload: { action: spoof, ...payload } })[invokedAction](); assert.equal(out.ok, true); assert.equal(out.action, invokedAction); assert.notEqual(out.action, spoof); return out; }
const params = value => ({ params: JSON.stringify(value) });
async function main() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-mismatch-'));
  const config = { root, metadataRoot: path.join(root, '.meta') };
  const start = await call(config, 'missionStart', params({ goal: 'loop mismatch', minimumInnovationWindowMs: 0 }), 'missionRoomSummit');
  const missionId = start.missionId;
  await call(config, 'missionSelfImproveStart', params({ missionId, minimumRuntimeMs: 0, minimumSelfImproveCycles: 2, minimumInnovations: 10, minimumNoveltyScore: 1, minimumMergeCourtPasses: 0 }), 'missionRoomLoopCourt');
  const outs = await Promise.all([
    call(config, 'missionSelfImprovePulse', params({ missionId, agentId: 'a', proof: 'a' }), 'missionRoomSummit'),
    call(config, 'missionSelfImproveStatus', params({ missionId }), 'missionSelfImprovePulse'),
    call(config, 'missionRoomSelfImprovePulse', params({ missionId, agentId: 'b', proof: 'b' }), 'missionSelfImproveCourt'),
    call(config, 'missionRoomSummit', params({ missionId }), 'missionRoomSelfImprovePulse')
  ]);
  assert.deepEqual(outs.map(o => o.action).sort(), ['missionRoomSelfImprovePulse','missionRoomSummit','missionSelfImprovePulse','missionSelfImproveStatus'].sort());
  console.log(JSON.stringify({ ok: true, missionId, actions: outs.map(o => o.action) }, null, 2));
}
main().catch(e => { console.error(e); process.exit(1); });
