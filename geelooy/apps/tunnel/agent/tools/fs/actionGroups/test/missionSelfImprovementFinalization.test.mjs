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
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'self-improve-final-'));
  const config = { root, metadataRoot: path.join(root, '.meta') };
  const start = await action(config, 'missionStart', params({ goal: 'finalization blocked by self improve', minimumInnovationWindowMs: 0 }));
  const missionId = start.missionId;
  await action(config, 'missionSelfImproveStart', params({ missionId, minimumRuntimeMs: 0, minimumSelfImproveCycles: 5, minimumInnovations: 50, minimumNoveltyScore: 20, minimumMergeCourtPasses: 0 }));
  const fin = await action(config, 'missionFinalize', params({ missionId, minimumProductiveCycles: 0, minimumProductiveMs: 0, minimumInnovationWindowMs: 0 }));
  const issues = fin.finalizationAttempt.verdict?.issues || fin.finalizationAttempt.issues || [];
  assert(issues.some(x => String(x).startsWith('self_improve_')));
  assert.equal(fin.finalAnswerAllowed, false);
  assert.equal(fin.mustCallNext.action, 'missionSelfImprovePulse');
  console.log(JSON.stringify({ ok: true, missionId, issues: issues.filter(x => String(x).startsWith('self_improve_')) }, null, 2));
}
main().catch(e => { console.error(e); process.exit(1); });
