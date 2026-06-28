// B"H
import { createRequire } from 'module';
import assert from 'assert/strict';
const require = createRequire(import.meta.url);
const Stuck = require('../../mission/stuckness/index.js');
const lock = { missionId:'m1', lastMustCallNext:{ action:'missionNext', missionId:'m1' } };
for (let i = 0; i < 3; i++) Stuck.apply(lock, { action:'missionNext', missionId:'m1' });
assert.equal(lock.lastMustCallNext.action, 'missionRepeatBetter');
console.log(JSON.stringify({ ok:true, recoveredTo:lock.lastMustCallNext.action }, null, 2));
