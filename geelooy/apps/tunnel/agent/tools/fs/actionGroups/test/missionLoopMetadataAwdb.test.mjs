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
  const base = await fs.mkdtemp(path.join(os.tmpdir(), 'loop-awdb-'));
  const root = path.join(base, 'git', 'project'); await fs.mkdir(root, { recursive: true });
  const meta = path.join(base, '.meta'); const config = { root, metadataRoot: meta };
  const start = await action(config, 'missionStart', params({ goal: 'loop metadata awdb', minimumInnovationWindowMs: 0 }));
  const missionId = start.missionId;
  await action(config, 'missionSelfImproveStart', params({ missionId, minimumRuntimeMs: 0, minimumSelfImproveCycles: 1, minimumInnovations: 5, minimumNoveltyScore: 1, minimumMergeCourtPasses: 0 }));
  await action(config, 'missionSelfImprovePulse', params({ missionId, proof: 'metadata proof' }));
  await action(config, 'missionRoomSummit', params({ missionId }));
  const ms = await action(config, 'missionMetadataStatus', params({ projectRoot: root }));
  assert.equal(ms.metadata.metadataRoot, meta);
  assert(ms.metadata.files.some(f => f.endsWith('.awdb')));
  assert.equal(ms.metadata.files.some(f => f.endsWith('.json')), false);
  console.log(JSON.stringify({ ok: true, missionId, metadataRoot: meta, files: ms.metadata.files }, null, 2));
}
main().catch(e => { console.error(e); process.exit(1); });
