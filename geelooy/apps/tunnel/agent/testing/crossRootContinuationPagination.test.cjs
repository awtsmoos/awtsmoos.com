// B"H
/**
 * @file crossRootContinuationPagination.test.cjs
 * @description Continued reconciliation visits each bounded state-root page
 * instead of repeating the first page during startup.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Fixtures = require("./helpers/crossRoot/fixtures.cjs");
const Roots = require("../tools/fs/commandJob/stateRootsAsync.js");
const Reconciler = require("../tools/fs/commandJob/crossRootReconciler.js");

test("bounded root pages are disjoint and eventually finish", async () => {
	const base = fs.mkdtempSync(path.join(os.tmpdir(), "awts-root-cursor-"));
	const stateBase = path.join(base, "device-state");
	try {
		for (let i = 0; i < 5; i++) {
			const root = path.join(stateBase, `root-${i}`);
			fs.mkdirSync(root, { recursive: true });
			Fixtures.writeJob(root, `job-${i}`, {
				status: "running",
				processIdentity: {
					pid: 7000 + i,
					processGroupId: 7000 + i,
					birthToken: `birth-${i}`,
					platform: process.platform
				}
			});
		}
		const config = Fixtures.config(base, path.join(stateBase, "root-4"));
		const pages = [];
		const reports = [];
		for (const rootOffset of [0, 2, 4]) {
			const options = { apply: false, maxRoots: 2, maxJobs: 100, maxActions: 100, rootOffset };
			pages.push(await Roots.discover(config, options));
			reports.push(await Reconciler.runBatch(config, options));
		}
		const names = pages.flatMap(page => page.roots.map(root => root.name));
		assert.equal(new Set(names).size, 5);
		assert.equal(names.length, 5);
		assert.equal(reports[0].nextRootOffset, 2);
		assert.equal(reports[1].nextRootOffset, 4);
		assert.equal(reports[2].truncated, false);
	} finally {
		fs.rmSync(base, { recursive: true, force: true });
	}
});
