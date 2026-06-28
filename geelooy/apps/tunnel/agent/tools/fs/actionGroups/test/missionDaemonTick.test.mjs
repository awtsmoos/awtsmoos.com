// B"H
import { createRequire } from 'module';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import assert from 'assert/strict';
const require = createRequire(import.meta.url);
const Lock = require('../../mission/lock/index.js');
const Tick = require('../../mission/daemon/tick.js');
const root = await fs.mkdtemp(path.join(os.tmpdir(), 'mission-daemon-'));
const config = { root, repoRoot: process.cwd() };
Lock.start(config, { action:'missionStart', missionId:'m1', mustCallNext:{ action:'stepA', missionId:'m1' } }, { autoSeedNext8:false });
function buildActions(){ return { stepA: async()=>({ ok:true, action:'stepA', mustCallNext:{ action:'stepB', missionId:'m1' } }) }; }
const out = await Tick.tick(config, { autoAnswer:true }, buildActions);
assert.equal(out.ticked, true); assert.equal(out.ranAction, 'stepA');
assert.equal(Lock.active(config).lastMustCallNext.action, 'stepB');
console.log(JSON.stringify({ ok:true, ran:out.ranAction, next:out.mustCallNext.action }, null, 2));
