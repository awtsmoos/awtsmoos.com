// B"H
import { createRequire } from 'module';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import assert from 'assert/strict';
const require = createRequire(import.meta.url);
const { buildMissionActions } = require('../missionActions.js');
async function action(config, name, payload = {}) {
  const out = await buildMissionActions({ config, payload: { action: name, ...payload } })[name]();
  assert.equal(out.ok, true);
  assert.equal(out.action, name);
  return out;
}
const params = value => ({ params: JSON.stringify(value) });
async function main() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'self-improve-scheduler-'));
  const meta = path.join(root, '.meta');
  const config = { root, metadataRoot: meta };
  const start = await action(config, 'missionStart', params({ goal: 'scheduler proof', metadata: { projectRoot: root }, minimumInnovationWindowMs: 0 }));
  const missionId = start.missionId;
  await action(config, 'missionSelfImproveStart', params({ missionId, minimumRuntimeMs: 0, minimumSelfImproveCycles: 2, minimumInnovations: 10, minimumNoveltyScore: 2, minimumMergeCourtPasses: 0 }));
  const run = await action(config, 'missionSelfImproveSchedulerRun', params({ missionId, windowMs: 10000, maxRuns: 2, maxPulsesPerRun: 1, proof: 'scheduler proof', file: 'scheduler.js', test: 'node scheduler.test.js' }));
  assert(run.scheduler.runs >= 1);
  assert(run.scheduler.pulses >= 1);
  assert(['court_passed', 'max_runs_reached'].includes(run.scheduler.reason));
  const status = await action(config, 'missionSelfImproveSchedulerStatus', params({ missionId }));
  assert.equal(status.scheduler.count, 1);
  await action(config, 'missionRoomCreate', params({ missionId, projectRoot: root, roomName: 'Scheduler Room' }));
  await action(config, 'missionRoomUserMessage', params({ missionId, body: 'Pause and prove recovery before continuing.' }));
  const blocked = await action(config, 'missionRoomSchedulerRun', params({ missionId, maxRuns: 1, maxPulsesPerRun: 1 }));
  assert.equal(blocked.scheduler.reason, 'blocked_interrupt');
  assert.equal(blocked.scheduler.mustCallNext.action, 'missionRoomRecoverInterrupt');
  const metaStatus = await action(config, 'missionMetadataStatus', params({ metadataRoot: meta }));
  assert.equal(metaStatus.metadata.hasJsonFiles, false);
  assert(metaStatus.metadata.files.some(f => f.endsWith('.awdb')));
  console.log(JSON.stringify({ ok: true, missionId, schedulerRuns: status.scheduler.count, firstReason: run.scheduler.reason, blocked: blocked.scheduler.reason }, null, 2));
}
main().catch(e => { console.error(e); process.exit(1); });
