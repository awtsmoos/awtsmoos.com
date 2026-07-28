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
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'self-improve-resume-'));
  const meta = path.join(root, '.meta');
  const config = { root, metadataRoot: meta };
  const start = await action(config, 'missionStart', params({ goal: 'scheduler resume proof', metadata: { projectRoot: root }, minimumInnovationWindowMs: 0 }));
  const missionId = start.missionId;
  await action(config, 'missionSelfImproveStart', params({ missionId, minimumRuntimeMs: 0, minimumSelfImproveCycles: 4, minimumInnovations: 30, minimumNoveltyScore: 4, minimumMergeCourtPasses: 0 }));
  const first = await action(config, 'missionSelfImproveSchedulerRun', params({ missionId, maxRuns: 1, maxPulsesPerRun: 1, stopWhenCourtPasses: false, proof: 'first proof', file: 'resume-a.js', test: 'node resume-a.test.js' }));
  assert.equal(first.scheduler.runs, 1);
  const statusOne = await action(config, 'missionSelfImproveSchedulerStatus', params({ missionId }));
  assert(statusOne.persistedSchedulerRecords >= 3);
  const resumed = await action(config, 'missionSelfImproveSchedulerResume', params({ missionId, maxRuns: 1, maxPulsesPerRun: 1, stopWhenCourtPasses: false, proof: 'resume proof', file: 'resume-b.js', test: 'node resume-b.test.js' }));
  assert.equal(resumed.scheduler.resumed, true);
  assert(resumed.scheduler.previousSchedulerRecords >= statusOne.persistedSchedulerRecords);
  assert.equal(resumed.scheduler.runs, 1);
  const statusTwo = await action(config, 'missionSelfImproveSchedulerStatus', params({ missionId }));
  assert(statusTwo.persistedSchedulerRecords > statusOne.persistedSchedulerRecords);
  await action(config, 'missionRoomCreate', params({ missionId, roomName: 'Resume Room', projectRoot: root }));
  await action(config, 'missionRoomUserMessage', params({ missionId, body: 'Block the room resume until interrupt is handled.' }));
  const roomResume = await action(config, 'missionRoomSchedulerResume', params({ missionId, maxRuns: 1, maxPulsesPerRun: 1 }));
  assert.equal(roomResume.scheduler.resumed, true);
  assert.equal(roomResume.scheduler.reason, 'blocked_interrupt');
  assert.equal(roomResume.scheduler.mustCallNext.action, 'missionRoomRecoverInterrupt');
  const metaStatus = await action(config, 'missionMetadataStatus', params({ metadataRoot: meta }));
  assert.equal(metaStatus.metadata.hasJsonFiles, true);
  assert(metaStatus.metadata.files.some(f => f.endsWith('.jsonl')));
  console.log(JSON.stringify({ ok: true, missionId, before: statusOne.persistedSchedulerRecords, after: statusTwo.persistedSchedulerRecords, roomResume: roomResume.scheduler.reason }, null, 2));
}
main().catch(e => { console.error(e); process.exit(1); });
