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
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'self-improve-command-'));
  const meta = path.join(root, '.meta');
  const config = { root, metadataRoot: meta };
  const start = await action(config, 'missionStart', params({ goal: 'command suspend proof', metadata: { projectRoot: root }, minimumInnovationWindowMs: 0 }));
  const missionId = start.missionId;
  await action(config, 'missionSelfImproveStart', params({ missionId, minimumRuntimeMs: 0, minimumSelfImproveCycles: 4, minimumInnovations: 30, minimumNoveltyScore: 4, minimumMergeCourtPasses: 0 }));
  const suspended = await action(config, 'missionSelfImproveSchedulerRun', params({ missionId, jobId: 'job-alpha', commandStatus: 'running', maxRuns: 2, maxPulsesPerRun: 1 }));
  assert.equal(suspended.scheduler.reason, 'command_suspended');
  assert.equal(suspended.scheduler.runs, 0);
  assert.equal(suspended.scheduler.pulses, 0);
  assert.equal(suspended.scheduler.mustCallNext.action, 'missionSelfImproveSchedulerResume');
  assert.equal(suspended.scheduler.mustCallNext.jobId, 'job-alpha');
  const statusOne = await action(config, 'missionSelfImproveSchedulerStatus', params({ missionId }));
  assert(statusOne.persistedSchedulerRecords >= 2);
  const resumed = await action(config, 'missionSelfImproveSchedulerResume', params({ missionId, jobId: 'job-alpha', commandStatus: 'completed', maxRuns: 1, maxPulsesPerRun: 1, stopWhenCourtPasses: false, proof: 'command finished proof', file: 'command.js', test: 'node command.test.js' }));
  assert.equal(resumed.scheduler.resumed, true);
  assert.equal(resumed.scheduler.reason, 'max_runs_reached');
  assert.equal(resumed.scheduler.runs, 1);
  assert.equal(resumed.scheduler.pulses, 1);
  const statusTwo = await action(config, 'missionSelfImproveSchedulerStatus', params({ missionId }));
  assert(statusTwo.persistedSchedulerRecords > statusOne.persistedSchedulerRecords);
  await action(config, 'missionRoomCreate', params({ missionId, roomName: 'Command Room', projectRoot: root }));
  const roomSuspended = await action(config, 'missionRoomSchedulerRun', params({ missionId, jobId: 'job-room', commandStatus: 'running', maxRuns: 1, maxPulsesPerRun: 1 }));
  assert.equal(roomSuspended.scheduler.reason, 'command_suspended');
  assert.equal(roomSuspended.scheduler.mustCallNext.action, 'missionRoomSchedulerResume');
  await action(config, 'missionRoomUserMessage', params({ missionId, body: 'interrupt after command finishes' }));
  const roomResume = await action(config, 'missionRoomSchedulerResume', params({ missionId, jobId: 'job-room', commandStatus: 'completed', maxRuns: 1, maxPulsesPerRun: 1 }));
  assert.equal(roomResume.scheduler.resumed, true);
  assert.equal(roomResume.scheduler.reason, 'blocked_interrupt');
  assert.equal(roomResume.scheduler.mustCallNext.action, 'missionRoomRecoverInterrupt');
  const metaStatus = await action(config, 'missionMetadataStatus', params({ metadataRoot: meta }));
  assert.equal(metaStatus.metadata.hasJsonFiles, true);
  assert(metaStatus.metadata.files.some(f => f.endsWith('.jsonl')));
  console.log(JSON.stringify({ ok: true, missionId, suspended: suspended.scheduler.reason, resumed: resumed.scheduler.reason, roomResume: roomResume.scheduler.reason }, null, 2));
}
main().catch(e => { console.error(e); process.exit(1); });
