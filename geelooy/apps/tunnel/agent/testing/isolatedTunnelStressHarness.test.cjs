// B"H
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { buildActions } = require('../tools/fs/actions.js');
const P = require('../lib/runtime/priority.js');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-isolated-tunnel-stress-'));
fs.mkdirSync(path.join(root, '.git'));

const config = {
  root,
  allowCommands: true,
  allowWrite: true,
  allowSecrets: true,
  tools: { command: true, fsRead: true, fsWrite: true, fsBulk: true }
};

function actions(payload) {
  return buildActions(config, { allowCommands: true, ...payload }, null);
}

(async () => {
  const node = JSON.stringify(process.execPath);
  const start = await actions({
    action: 'commandStart',
    command: `${node} -e "setTimeout(()=>process.stdout.write('done'), 5000)"`,
    cwd: '.',
    timeoutMs: 20000
  }).commandStart();
  assert.equal(start.ok, true, start.error);

  const polls = await Promise.all(Array.from({ length: 20 }, () =>
    actions({ action: 'commandStatus', jobId: start.jobId }).commandStatus()
  ));
  assert.equal(polls.length, 20);
  assert(polls.every(poll => poll.ok === true));

  const lanes = P.makeLaneState();
  lanes.p3_heavy.inflight = 1;
  P.enqueue(lanes, { data: { payload: { kind: 'command', action: 'commandStatus' } } });
  assert.equal(P.canStartLane(lanes, 'p0_control', {
    MAX_INFLIGHT: 1,
    CONTROL_QUEUE_LIMIT: 32,
    LANE_LIMITS: { p0_control: 4, p1_fs_light: 1, p2_chrome_light: 1, p3_heavy: 1, p4_bulk: 1 }
  }), true);

  const cancel = await actions({ action: 'commandCancel', jobId: start.jobId }).commandCancel();
  assert.equal(cancel.ok, true);

  const huge = await actions({
    action: 'command',
    command: `${node} -e "process.stdout.write('x'.repeat(120000))"`,
    cwd: '.',
    inline: true,
    maxChars: 4000,
    maxBytes: 200000
  }).command();
  assert.equal(huge.ok, true, huge.error);
  assert.equal(huge.outputPaged, true);
  assert(huge.stdout.length <= 4000);
  assert(huge.nextStdoutPagePayload);

  const page = await actions(huge.nextStdoutPagePayload).commandOutputPage();
  assert.equal(page.ok, true);
  assert(page.returnedChars > 0);

  console.log(JSON.stringify({ ok: true, suite: 'isolated-tunnel-stress-harness', root }, null, 2));
})().catch(error => {
  console.error(error);
  process.exit(1);
});
