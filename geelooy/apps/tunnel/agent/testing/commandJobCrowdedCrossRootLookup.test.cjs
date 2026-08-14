// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Fixture = require("./helpers/crossRoot/fixtures.cjs");
const Locator = require("../tools/fs/commandJob/jobLocator.js");
const Roots = require("../tools/fs/commandJob/stateRootsAsync.js");

/**
 * @file Reproduces an exact durable job hidden below the global newest-root window.
 * @description
 * The Awtsmoos lets unrelated historical roots multiply without hiding one tunnel family's deed;
 * Awtsmoos.com searches the relevant family and fails closed whenever bounded completeness is unproven.
 */
(async () => {
	const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "awts-crowded-job-"));
	try {
		const base = path.join(temporary, "device-state");
		const current = root(base, "awt-test", "111111111111");
		const target = root(base, "awt-test", "222222222222");
		const sibling = root(base, "awt-test", "333333333333");
		for (const stateRoot of [current, target, sibling]) fs.mkdirSync(stateRoot, { recursive: true });
		const jobId = "cmdjob_crowded_exact";
		Fixture.writeJob(target, jobId, {
			status: "completed",
			finishedAt: new Date().toISOString()
		});
		age(target, 10000);
		for (let index = 0; index < 80; index += 1) {
			const noise = root(base, `historical-${index}`, hex(index));
			fs.mkdirSync(noise, { recursive: true });
			age(noise, 100 + index);
		}
		age(current, 1);
		age(sibling, 2);
		const config = Fixture.config(temporary, current);
		const generic = await Roots.discover(config, { stateBase: base, maxRoots: 32 });
		assert.equal(generic.roots.some(entry => entry.path === target), false);
		assert.equal(generic.truncated, true);
		const family = await Roots.discoverFamily(config, { stateBase: base });
		assert.equal(family.totalRoots, 3);
		assert.equal(family.truncated, false);
		assert.equal(family.roots.some(entry => entry.path === target), true);
		const located = await Locator.locate(config, jobId, { stateBase: base });
		assert.equal(located.ok, true);
		assert.equal(located.stateRoot, target);
		assert.equal(located.meta.status, "completed");
		const truncated = await Locator.locate(config, jobId, {
			stateBase: base,
			maxFamilyRoots: 1
		});
		assert.equal(truncated.ok, false);
		assert.equal(truncated.error, "job_root_scan_truncated");
		Fixture.writeJob(sibling, jobId, { status: "completed" });
		const ambiguous = await Locator.locate(config, jobId, { stateBase: base });
		assert.equal(ambiguous.ok, false);
		assert.equal(ambiguous.error, "job_state_ambiguous");
		console.log(JSON.stringify({
			ok: true,
			suite: "command-job-crowded-cross-root",
			globalTargetHidden: true,
			familyTargetFound: true,
			truncationFailsClosed: true,
			ambiguityFailsClosed: true
		}));
	} finally {
		fs.rmSync(temporary, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});

function root(base, family, hash) {
	return path.join(base, `${family}-${hash}`);
}

function hex(index) {
	return index.toString(16).padStart(12, "0").slice(-12);
}

function age(target, seconds) {
	const when = new Date(Date.now() - seconds * 1000);
	fs.utimesSync(target, when, when);
}
