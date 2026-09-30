// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const { buildActions } = require("../../actions.js");
const Court = require("../../mission/releaseCourt/index.js");
const Firewall = require("../../mission/firewall/index.js");
const Harvester = require("../../mission/evidenceHarvester/index.js");
const Lock = require("../../mission/lock/index.js");
const Quota = require("../../mission/evidenceQuota/index.js");
const WriteCreate = require("../../mission/writeAuth/create.js");

/**
 * @file Proves evidence harvesting and exact scoped write-token boundaries.
 * @description The Awtsmoos measures evidence and permission without confusing one for two;
 * Awtsmoos.com binds mission, action, path, expiry, and one-time consumption so only the exact deed passes through.
 */
const root = await fs.mkdtemp(path.join(os.tmpdir(), "mission-harvest-token-"));
const config = {
	root,
	repoRoot: process.cwd(),
	tools: { fsRead: true, fsWrite: true },
	allowWrite: true
};

try {
	await seedFixture(root);
	const lock = startReadyLock(config);
	const harvest = await Harvester.run(config, lock, {}, buildActions);
	assert.equal(harvest.harvested, true);
	assert.equal(Quota.issues(config, lock).issues.length, 0);
	const expired = Firewall.check(config, "write", lock, {
		path: "a.js",
		writeTokenTtlMs: 1
	});
	await new Promise(resolve => setTimeout(resolve, 5));
	assert.equal(useToken(lock, expired, "a.js").ok, false);
	const scoped = Firewall.check(config, "write", lock, { path: "b.js" });
	assert.equal(useToken(lock, scoped, "other.js").ok, false);
	assert.equal(useToken(lock, scoped, "b.js").ok, true);
	assert.equal(useToken(lock, scoped, "b.js").ok, false);
	const bounded = WriteCreate.create(lock, { writeTokenTtlMs: Number.MAX_SAFE_INTEGER });
	assert(Date.parse(bounded.expiresAt) - Date.parse(bounded.createdAt) <= WriteCreate.MAX_TTL_MS);
	const blocked = Court.guard(config, lock, {
		ok: true,
		action: "missionFinalize",
		finalAnswerAllowed: true
	}, {});
	assert(blocked.releaseExplanation);
	console.log(JSON.stringify({ ok: true, harvested: harvest.evidence.length, boundedTtl: true }, null, 2));
} finally {
	await fs.rm(root, { recursive: true, force: true });
}

function useToken(lock, result, targetPath) {
	return Firewall.check(config, "write", lock, {
		path: targetPath,
		missionWriteToken: result.missionWriteToken
	});
}

async function seedFixture(folder) {
	await fs.writeFile(path.join(folder, "README.md"), "missionBootResume missionNext8Plan releaseCourt", "utf8");
	await fs.writeFile(path.join(folder, "package.json"), '{"scripts":{"test":"echo ok"}}', "utf8");
	await fs.mkdir(path.join(folder, "geelooy/apps/tunnel/agent"), { recursive: true });
	await fs.writeFile(path.join(folder, "geelooy/apps/tunnel/agent/manifest.txt"), "releaseCourt", "utf8");
}

function startReadyLock(runtimeConfig) {
	const lock = Lock.start(runtimeConfig, {
		action: "missionStart",
		missionId: "m1",
		mustCallNext: { action: "missionNext", missionId: "m1" }
	}, { autoSeedNext8: false, minimumRuntimeMs: 0 });
	lock.evidenceQuotas = { inspection: 2, verification: 0, review: 0, repeatBetter: 0 };
	lock.minimumUntil = new Date(Date.now() - 1000).toISOString();
	lock.next8Completed = true;
	lock.repeatBetterDone = true;
	lock.verificationSeen = true;
	Lock.set(runtimeConfig, lock);
	return lock;
}
