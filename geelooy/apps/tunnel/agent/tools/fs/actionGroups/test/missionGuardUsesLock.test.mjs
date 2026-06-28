// B"H
import { createRequire } from 'module';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import assert from 'assert/strict';
const require = createRequire(import.meta.url);
const Lock = require('../../mission/lock/index.js');
const Guard = require('../../mission/activeGuard/index.js');
const root = await fs.mkdtemp(path.join(os.tmpdir(), 'mission-guard-lock-'));
const config = { root, repoRoot: process.cwd() };
Lock.start(config, { action:'missionStart', missionId:'m_done', mustCallNext:{ action:'missionNext', missionId:'m_done' } }, { autoSeedNext8:false });
assert.equal(await Guard.check(config, { action:'read' }), null);
const block = await Guard.check(config, { action:'deleteFile' });
assert.equal(block.error, 'mission_lock_blocks_unrelated_action');
assert.equal(block.missionId, 'm_done');
assert.equal(await Guard.check(config, { action:'missionNext' }), null);
console.log(JSON.stringify({ ok:true, absorbed:'read', blocked:block.blockedAction, missionId:block.missionId }, null, 2));
