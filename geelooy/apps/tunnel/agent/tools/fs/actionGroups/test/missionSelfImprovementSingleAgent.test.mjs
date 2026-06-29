// B"H
import { createRequire } from 'module';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import assert from 'assert/strict';
const require = createRequire(import.meta.url);
const { buildMissionActions } = require('../missionActions.js');
async function action(config, name, payload = {}) { const out = await buildMissionActions({ config, payload: { action: name, ...payload } })[name](); assert.equal(out.ok, true); assert.equal(out.action, name); return out; }
const params = value => ({ params: JSON.stringify(value) });
async function main() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'self-improve-single-'));
  const config = { root, metadataRoot: path.join(root, '.meta') };
  const start = await action(config, 'missionStart', params({ goal: 'single self improve', minimumInnovationWindowMs: 0 }));
  const missionId = start.missionId;
  await action(config, 'missionSelfImproveStart', params({ missionId, minimumRuntimeMs: 0, minimumSelfImproveCycles: 2, minimumInnovations: 10, minimumNoveltyScore: 2, minimumMergeCourtPasses: 0 }));
  const next = await action(config, 'missionNext', params({ missionId }));
  assert.equal(next.next.verdict, 'self_improvement_continue');
  const p1 = await action(config, 'missionSelfImprovePulse', params({ missionId, proof: 'first proof', file: 'a.js' }));
  assert.equal(p1.pulse.role.role, 'builder');
  const p2 = await action(config, 'missionSelfImprovePulse', params({ missionId, proof: 'second proof', test: 'node test.js' }));
  assert.equal(p2.pulse.role.role, 'breaker');
  const st = await action(config, 'missionSelfImproveStatus', params({ missionId }));
  assert.equal(st.selfImprovement.receipts.count, 2);
  assert.equal(st.selfImprovement.ledger.total, 10);
  assert.equal(st.selfImprovement.court.ok, true);
  console.log(JSON.stringify({ ok: true, missionId, root }, null, 2));
}
main().catch(e => { console.error(e); process.exit(1); });
