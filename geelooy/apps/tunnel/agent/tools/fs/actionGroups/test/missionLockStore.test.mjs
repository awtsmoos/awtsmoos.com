// B"H
import { createRequire } from 'module';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import assert from 'assert/strict';
const require = createRequire(import.meta.url);
const Lock = require('../../mission/lock/index.js');
const root = await fs.mkdtemp(path.join(os.tmpdir(), 'mission-lock-'));
const config = { root, repoRoot: process.cwd() };
const lock = Lock.start(config, { ok:true, action:'missionStart', missionId:'m1', mustCallNext:{ action:'missionNext', missionId:'m1' } }, { minimumRuntimeMs:3600000 });
assert.equal(lock.missionId, 'm1'); assert.equal(lock.releaseAllowed, false);
assert.equal(Lock.active(config).missionId, 'm1');
Lock.update(config, { action:'missionNext', mustCallNext:{ action:'missionAnswer', missionId:'m1' } }, {});
assert.equal(Lock.active(config).lastMustCallNext.action, 'missionAnswer');
console.log(JSON.stringify({ ok:true, missionId:Lock.active(config).missionId, releaseStatus:Lock.active(config).releaseStatus }, null, 2));
