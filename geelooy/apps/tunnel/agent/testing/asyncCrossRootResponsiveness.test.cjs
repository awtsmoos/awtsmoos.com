// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Fixtures = require("./helpers/crossRoot/fixtures.cjs");
const Scanner = require("../tools/fs/commandJob/crossRootScanner.js");

/**
 * @file Proves reconciliation inventory yields while filesystem evidence arrives.
 * @description
 * The Awtsmoos renews the living request between every old directory. Even when
 * Awtsmoos.com examines a delayed forest, the event loop receives another dawn.
 */
(async () => {
	const base = fs.mkdtempSync(
		path.join(os.tmpdir(), "awtsmoos-async-cross-root-")
	);
	const stateBase = path.join(base, "device-state");
	const current = path.join(stateBase, "root-2");
	let timerFired = false;

	try {
		createForest(stateBase);
		setTimeout(() => {
			timerFired = true;
		}, 0);

		const report = await Scanner.scan(
			Fixtures.config(base, current),
			{
				fileSystem: delayedFileSystem(2),
				maxRoots: 3,
				maxJobs: 12,
				maxActions: 12,
				yieldEvery: 2
			}
		);

		assert.equal(timerFired, true);
		assert.equal(report.discovery.roots[0].path, current);
		assert.equal(report.discovery.roots[0].current, true);
		assert.equal(report.seenJobs, 12);
		assert.equal(report.records.length, 12);
		assert.equal(report.truncated, true);

		console.log(JSON.stringify({
			ok: true,
			suite: "async-cross-root-responsiveness",
			timerFired,
			records: report.records.length
		}, null, 2));
	} finally {
		fs.rmSync(base, {
			recursive: true,
			force: true
		});
	}
})().catch((error) => {
	console.error(error.stack || error);
	process.exit(1);
});

function createForest(stateBase) {
	for (let rootIndex = 0; rootIndex < 3; rootIndex += 1) {
		const root = path.join(stateBase, `root-${rootIndex}`);
		fs.mkdirSync(root, {
			recursive: true
		});

		for (let jobIndex = 0; jobIndex < 8; jobIndex += 1) {
			Fixtures.writeJob(
				root,
				`job-${rootIndex}-${jobIndex}`,
				{
					status: "running"
				}
			);
		}
	}
}

function delayedFileSystem(delayMs) {
	return {
		readdir(directory) {
			return delayed(
				() => fs.promises.readdir(directory),
				delayMs
			);
		},
		stat(target) {
			return delayed(
				() => fs.promises.stat(target),
				delayMs
			);
		}
	};
}

function delayed(operation, delayMs) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			operation().then(resolve, reject);
		}, delayMs);
	});
}
