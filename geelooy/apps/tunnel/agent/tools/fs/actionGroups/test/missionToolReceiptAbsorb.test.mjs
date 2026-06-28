// B"H
import { createRequire } from 'module';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import assert from 'assert/strict';
const require = createRequire(import.meta.url);
const Lock = require('../../mission/lock/index.js');
const Receipts = require('../../mission/toolReceipts/index.js');
const { withDb } = require('../../awdb/open.js');
const root = await fs.mkdtemp(path.join(os.tmpdir(), 'mission-receipt-'));
const config = { root, repoRoot: process.cwd() };
Lock.start(config, { action:'missionStart', missionId:'m1' }, {});
const receipt = Receipts.after(config, { action:'read', p:'README.md' }, { ok:true, action:'read' });
assert.equal(receipt.kind, 'inspection'); assert.equal(receipt.missionId, 'm1');
const count = withDb(config, 'missions', db => (db.root.missionToolReceipts || []).length);
assert.equal(count, 1);
console.log(JSON.stringify({ ok:true, kind:receipt.kind, count }, null, 2));
