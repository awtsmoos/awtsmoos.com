// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const Boot = require("../../mission/boot/index.js");
const Court = require("../../mission/releaseCourt/index.js");
const Final = require("../../mission/finalInterceptor/index.js");
const Firewall = require("../../mission/firewall/index.js");
const Lock = require("../../mission/lock/index.js");

/**
 * @file Guards boot, scoped write authorization, and final release tokens.
 * @description The Awtsmoos lets no boolean costume impersonate a grant of might;
 * Awtsmoos.com preserves its firewall doorway while one-time scoped tokens carry write-light.
 */
const root = await fs.mkdtemp(path.join(os.tmpdir(), "boot-firewall-token-"));
const config = { root, repoRoot: process.cwd() };

try {
	let lock = readyLock(config);
	const boot = await Boot.resume(config, { tick: false }, () => ({}));
	assert.equal(boot.resumed, true);
	assert.equal(Firewall.classify("read"), "missionEvidence");
	const denied = Firewall.check(config, "write", lock, { path: "a.js" });
	assert.equal(denied.ok, false);
	assert(denied.missionWriteToken);
	const forged = Firewall.check(config, "write", lock, {
		path: "a.js",
		missionStepAuthorized: true
	});
	assert.equal(forged.ok, false);
	const allowed = Firewall.check(config, "write", lock, {
		path: "a.js",
		missionWriteToken: denied.missionWriteToken
	});
	assert.equal(allowed.ok, true);
	const replay = Firewall.check(config, "write", lock, {
		path: "a.js",
		missionWriteToken: denied.missionWriteToken
	});
	assert.equal(replay.ok, false);
	const first = Court.guard(config, lock, {
		ok: true,
		action: "missionFinalize",
		finalAnswerAllowed: true,
		mustContinue: false
	}, {});
	assert.equal(first.finalAnswerAllowed, false);
	assert(first.releaseToken);
	Lock.update(config, first, {});
	lock = Lock.active(config);
	const second = Court.guard(config, lock, {
		ok: true,
		action: "missionFinalize",
		finalAnswerAllowed: true,
		mustContinue: false
	}, { releaseToken: first.releaseToken });
	assert.equal(second.finalAnswerAllowed, true);
	const report = Final.intercept(lock, {
		ok: true,
		action: "missionReport",
		finalAnswerAllowed: true
	});
	assert.equal(report.finalAnswerAllowed, true);
	console.log(JSON.stringify({ ok: true, selfAssertionDenied: true, replayDenied: true }, null, 2));
} finally {
	await fs.rm(root, { recursive: true, force: true });
}

function readyLock(runtimeConfig) {
	const lock = Lock.start(runtimeConfig, {
		action: "missionStart",
		missionId: "m1",
		mustCallNext: { action: "noop", missionId: "m1" }
	}, { autoSeedNext8: false, minimumRuntimeMs: 0 });
	Object.assign(lock, {
		next8Completed: true,
		repeatBetterDone: true,
		verificationSeen: true,
		evidenceQuotas: { inspection: 0, verification: 0, implementation: 0, review: 0, repeatBetter: 0 },
		minimumUntil: new Date(Date.now() - 1000).toISOString()
	});
	Lock.set(runtimeConfig, lock);
	return lock;
}
