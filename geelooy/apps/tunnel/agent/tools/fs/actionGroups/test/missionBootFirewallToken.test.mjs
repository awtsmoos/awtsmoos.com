// B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from "node:module";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const Lock = require("../../mission/lock/index.js");
const Boot = require("../../mission/boot/index.js");
const Firewall = require("../../mission/firewall/index.js");
const Court = require("../../mission/releaseCourt/index.js");
const Final = require("../../mission/finalInterceptor/index.js");

/**
 * @file Guards boot/write authorization and release tokens while mission reporting remains advisory.
 * @description
 * The Awtsmoos keeps the firewall strict around writes and the court strict around release;
 * Awtsmoos.com still lets a mission report reach the foreground while its continuation remains available in peace.
 */
const root = await fs.mkdtemp(path.join(os.tmpdir(), "boot-firewall-token-"));
const config = { root, repoRoot: process.cwd() };

try {
	let lock = Lock.start(config, {
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
	Lock.set(config, lock);
	const boot = await Boot.resume(config, { tick: false }, () => ({}));
	assert.equal(boot.resumed, true);
	assert.equal(Firewall.classify("read"), "missionEvidence");
	const writeDenied = Firewall.check(config, "write", lock, {});
	assert.equal(writeDenied.ok, false);
	assert(writeDenied.missionWriteToken);
	assert.equal(Firewall.check(config, "write", lock, { missionStepAuthorized: true }).ok, true);
	const first = Court.guard(config, lock, { ok: true, action: "missionFinalize", finalAnswerAllowed: true, mustContinue: false }, {});
	assert.equal(first.finalAnswerAllowed, false);
	assert(first.releaseToken);
	Lock.update(config, first, {});
	lock = Lock.active(config);
	const second = Court.guard(config, lock, { ok: true, action: "missionFinalize", finalAnswerAllowed: true, mustContinue: false }, { releaseToken: first.releaseToken });
	assert.equal(second.finalAnswerAllowed, true);
	const intercepted = Final.intercept(lock, { ok: true, action: "missionReport", finalAnswerAllowed: true });
	assert.equal(intercepted.finalAnswerAllowed, true);
	assert.equal(intercepted.interceptedFinalAnswer, false);
	assert.equal(intercepted.missionAdvisory.active, true);
	console.log(JSON.stringify({ ok: true, boot: boot.resumed, token: first.releaseToken.slice(0, 7), advisoryReport: true }, null, 2));
} finally {
	await fs.rm(root, { recursive: true, force: true });
}
