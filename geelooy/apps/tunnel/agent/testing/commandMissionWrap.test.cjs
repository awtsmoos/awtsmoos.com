// B"H
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const Wrap = require('../tools/command/missionWrap.js');
const Lock = require('../tools/fs/mission/lock/index.js');
(async () => {
  const config = { root:fs.mkdtempSync(path.join(os.tmpdir(), 'cmd-wrap-')), allowCommands:true, tools:{ command:true }, command:{ enabled:true, defaultShell:'/bin/sh' } };
  const out = await Wrap.run(config, { action:'commandRun', command:'echo hi' }, async () => ({ ok:true, action:'commandRun', finalAnswerAllowed:true }));
  assert.equal(out.finalAnswerAllowed, false);
  assert.equal(out.mustContinue, true);
  assert.equal(out.missionLockActive, true);
  assert.equal(out.missionStatus.active, true);
  assert.equal(Lock.active(config).missionId, out.missionStatus.missionId);
  console.log(JSON.stringify({ ok:true, suite:'command-mission-wrap' }, null, 2));
})().catch(error => { console.error(error); process.exit(1); });
