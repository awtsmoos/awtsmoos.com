// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const Focus = require('../tools/fs/mission/response/compact.js');
const Boot = require('../tools/fs/mission/boot/resume.js');
const DaemonStatus = require('../tools/fs/mission/daemon/status.js');
const DaemonTick = require('../tools/fs/mission/daemon/tick.js');
const Lock = require('../tools/fs/mission/lock/index.js');
const Next8Plan = require('../tools/fs/mission/eightStep/plan.js');
const Next8Execute = require('../tools/fs/mission/eightStep/execute.js');
const Next8Review = require('../tools/fs/mission/eightStep/review.js');

function assertAdvisory(out, label) {
  assert.notStrictEqual(out.finalAnswerAllowed, false, `${label} must not block final answers`);
  assert.notStrictEqual(out.mustContinue, true, `${label} must not force continuation`);
  assert.notStrictEqual(out.userVisibleAnswerBlocked, true, `${label} must not expose user block`);
  assert.strictEqual(out.nextRequiredToolCall, undefined, `${label} must not require a next tool`);
}

(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-mission-advisory-'));
  const config = { root };
  const suggested = { action: 'missionRoomSchedulerStatus', missionId: 'm-advisory' };

  const compact = Focus.compact({
    ok: true,
    action: 'missionStatus',
    missionId: 'm-advisory',
    mustCallNext: suggested
  }, { action: 'missionStatus' });
  assertAdvisory(compact, 'compact mission status');
  assert.deepStrictEqual(compact.nextSuggestedToolCall, suggested);
  assert.strictEqual(compact.mustCallNext, undefined);

  const noActive = await Boot.resume(config, { autoStartMission: false }, () => ({}));
  assertAdvisory(noActive, 'boot resume without active mission');
  assert.strictEqual(noActive.resumeAvailable, false);

  Lock.set(config, {
    missionId: 'm-advisory',
    releaseAllowed: false,
    lastMustCallNext: suggested
  });

  const daemonStatus = DaemonStatus.status(config);
  assertAdvisory(daemonStatus, 'daemon status');
  assert.deepStrictEqual(daemonStatus.nextSuggestedToolCall, suggested);
  assert.strictEqual(daemonStatus.missionAdvisory.resumeAvailable, true);

  const daemonTick = await DaemonTick.tick(config, {}, () => ({
    missionRoomSchedulerStatus: async () => ({ ok: true, action: 'missionRoomSchedulerStatus' })
  }));
  assertAdvisory(daemonTick, 'daemon tick');
  assert.deepStrictEqual(daemonTick.nextSuggestedToolCall, suggested);

  const mission = { id: 'm-advisory', goal: 'fix tunnel/runtime files' };
  const planned = Next8Plan.create(mission, { steps: ['Read runtime files', 'Write fix', 'Run tests'] });
  assertAdvisory(planned, 'next8 plan');
  assert.strictEqual(planned.nextSuggestedToolCall.action, 'missionExecuteNext8');

  const executing = Next8Execute.run(mission, { stepIndex: 0 });
  assertAdvisory(executing, 'next8 execute');
  assert.strictEqual(executing.nextSuggestedToolCall.action, 'missionReviewNext8Step');

  const reviewed = Next8Review.review(mission, { stepIndex: 0, evidence: ['read completed'] });
  assertAdvisory(reviewed, 'next8 review');
  assert.strictEqual(reviewed.nextSuggestedToolCall.action, 'missionExecuteNext8');

  console.log(JSON.stringify({ ok: true, suite: 'mission-advisory-never-blocks-final-answer' }, null, 2));
})().catch(error => { console.error(error.stack || error.message); process.exit(1); });
