// B"H
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const Policy = require('../tools/fs/mission/implicitBoot/policy.js');
const Boot = require('../tools/fs/mission/implicitBoot/index.js');
const Lock = require('../tools/fs/mission/lock/index.js');
(async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'implicit-mission-'));
  const config = { root };
  assert.equal(Policy.shouldBoot({ action:'read' }), false);
  assert.equal(Policy.shouldBoot({ action:'commandRun' }), true);
  assert.equal(Policy.shouldBoot({ action:'previewExposeLocalServer' }), true);
  assert.equal(Policy.shouldBoot({ action:'commandRun', noMission:true }), false);
  const readBoot = await Boot.maybeStart(config, { action:'read' });
  assert.equal(readBoot, null);
  assert.equal(Lock.active(config), null);
  const boot = await Boot.maybeStart(config, { action:'commandRun', command:'echo hi' });
  assert(boot.mission.id.startsWith('auto_'));
  assert.equal(Lock.active(config).missionId, boot.mission.id);
  const annotated = Boot.annotate({ ok:true, action:'commandRun' }, boot);
  assert.equal(annotated.missionStatus.active, true);
  assert.equal(annotated.missionStatus.implicit, true);
  assert.match(annotated.agentGuidance.plainEnglish, /started a mission context/i);
  const noSecond = await Boot.maybeStart(config, { action:'previewExposeLocalServer' }, Lock.active(config));
  assert.equal(noSecond, null);
  console.log(JSON.stringify({ ok:true, suite:'mission-implicit-boot', missionId:boot.mission.id }, null, 2));
})().catch(error => { console.error(error); process.exit(1); });
