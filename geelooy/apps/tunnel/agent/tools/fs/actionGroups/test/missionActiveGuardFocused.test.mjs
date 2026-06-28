// B"H
import { createRequire } from 'module';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import assert from 'assert/strict';
const require = createRequire(import.meta.url);
const Lock = require('../../mission/lock/index.js');
const Guard = require('../../mission/activeGuard/index.js');
const Focus = require('../../mission/response/compact.js');
const root = await fs.mkdtemp(path.join(os.tmpdir(), 'guard-focus-'));
const config = { root, repoRoot: process.cwd() };
Lock.start(config, { action:'missionStart', missionId:'m1', mustCallNext:{ action:'missionNext', missionId:'m1' } }, { autoSeedNext8:false });
const block = await Guard.check(config, { action:'deleteTree' });
assert.equal(block.error, 'mission_lock_blocks_unrelated_action');
const compact = Focus.compact({ ok:true, action:'missionStart', missionId:'m1', huge:'x'.repeat(1000), mustCallNext:{ action:'missionNext', missionId:'m1' } }, { action:'missionStart' });
assert.equal(compact.responseShape, 'focused-mission-v4-minimal');
assert.equal(compact.huge, undefined);
console.log(JSON.stringify({ ok:true, missionId:block.missionId, blocked:block.blockedAction, shape:compact.responseShape }, null, 2));
