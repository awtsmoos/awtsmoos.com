// B"H
import { createRequire } from 'module';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import assert from 'assert/strict';

const require = createRequire(import.meta.url);
const Lock = require('../../mission/lock/index.js');
const Firewall = require('../../mission/firewall/index.js');
const Receipts = require('../../mission/toolReceipts/index.js');
const Quota = require('../../mission/evidenceQuota/index.js');
const Oath = require('../../mission/oath/index.js');
const Snapshot = require('../../mission/snapshot/index.js');
const StopAudit = require('../../mission/stopAudit/index.js');
const Takeover = require('../../mission/takeover/index.js');
const Deadman = require('../../mission/deadman/index.js');
const Final = require('../../mission/finalInterceptor/index.js');

const root = await fs.mkdtemp(path.join(os.tmpdir(), 'mission-hardening-'));
const config = { root, repoRoot: process.cwd() };
let lock = Lock.start(config, {
	action:'missionStart',
	missionId:'m1',
	mustCallNext:{ action:'missionNext', missionId:'m1' }
}, {
	autoSeedNext8:false,
	minimumRuntimeMs:0
});
lock.minimumUntil = new Date(Date.now() - 1000).toISOString();
lock.evidenceQuotas = {
	inspection:1,
	verification:1,
	review:0,
	repeatBetter:0
};
Lock.set(config, lock);

const denied = Firewall.check(config, 'write', lock, { path:'x.js' });
assert.equal(denied.ok, false);
assert(denied.missionWriteToken);
const wrongPath = Firewall.check(config, 'write', lock, {
	action:'write',
	path:'other.js',
	missionWriteToken:denied.missionWriteToken
});
assert.equal(wrongPath.ok, false);
const allowed = Firewall.check(config, 'write', lock, {
	action:'write',
	path:'x.js',
	missionWriteToken:denied.missionWriteToken
});
assert.equal(allowed.ok, true);

Receipts.after(config, { action:'read' }, { ok:true, action:'read' });
const q1 = Quota.issues(config, lock);
assert(q1.issues.some(issue => issue.startsWith('quota_verification')));
Receipts.after(config, { action:'commandRun' }, {
	ok:true,
	action:'commandRun'
});
const q2 = Quota.issues(config, lock);
assert.equal(q2.issues.length, 0);
assert.equal(Oath.accept(config, lock, { agentId:'alpha' }).agentId, 'alpha');
assert.equal(Snapshot.take(config, lock, 'test').reason, 'test');
lock.updatedAt = new Date(Date.now() - 999999).toISOString();
assert.equal(Deadman.stale(lock, 1000), true);
assert.equal(Takeover.claim(lock, 'beta').owner, 'beta');

const intercepted = Final.intercept(lock, {
	ok:true,
	action:'missionReport',
	finalAnswerAllowed:true
});
assert.equal(intercepted.interceptedFinalAnswer, false);
assert.equal(intercepted.finalAnswerAllowed, true);
assert.equal(intercepted.missionAdvisory.resumeAvailable, true);
assert.equal(StopAudit.after(config, lock, intercepted), null);
assert.equal(StopAudit.list(config).length, 0);

console.log(JSON.stringify({
	ok:true,
	token:denied.missionWriteToken.slice(0,7),
	quota:q2.issues.length,
	stopAttempts:StopAudit.list(config).length,
	finalAnswerPolicy:'advisory_resume_available'
}, null, 2));
