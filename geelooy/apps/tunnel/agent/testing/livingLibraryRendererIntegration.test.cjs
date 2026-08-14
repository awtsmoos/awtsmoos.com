// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const Fixture = require("./helpers/livingLibraryRendererFixture.cjs");

const installRoot = path.join(os.tmpdir(), `awtsmoos-library-renderer-${process.pid}`);
process.env.AWTSMOOS_INSTALL_ROOT = installRoot;

const { findChrome } = require("../tools/chrome/finder.js");
const ChromeProcesses = require("../tools/chrome/processes.js");
const { isolatedHtmlTest } = require("../tools/fs/isolatedHtml.js");
const repositoryRoot = path.resolve(__dirname, "../../../../..");

/**
 * @file Runs the Living Library renderer in an isolated real browser.
 * @description
 * The Awtsmoos proves progressive comment disclosure, static sidecar provenance,
 * safe markup, browser shutdown, and sandbox removal through the repository's real
 * Chrome-CDP path rather than a synthetic DOM or stale status-string assertion.
 */
async function run() {
	if (!findChrome()) {
		console.log(JSON.stringify({
			ok: true,
			suite: "living-library-renderer-integration",
			skipped: true,
			reason: "chrome_not_installed"
		}, null, 2));
		return;
	}
	try {
		const result = await isolatedHtmlTest(
			{ root: repositoryRoot, allowWrite: true, allowCommands: true },
			{
				files: Fixture.files,
				entry: Fixture.entry,
				urlPath: Fixture.entry,
				html: Fixture.html(),
				selector: '#proof[data-ok="true"]',
				assertNoConsoleErrors: true,
				timeoutMs: 20000
			}
		);
		assert.equal(result.ok, true, JSON.stringify(result));
		assert.equal(result.browser.selectorFound, true);
		assert.equal(result.browser.errorCount, 0);
		assert.equal(await ChromeProcesses.waitForClosed(result.browser.port, 3000), true);
		await new Promise(resolve => setTimeout(resolve, 500));
		await assert.rejects(fs.stat(result.sandbox), { code: "ENOENT" });
		console.log(JSON.stringify({
			ok: true,
			suite: "living-library-renderer-integration",
			rankedCommentsMerged: true,
			progressiveDisclosure: "2-to-3",
			staticSidecarsNotMislinked: true,
			safeMarkupPreserved: true,
			browserStopped: true,
			sandboxRemoved: true
		}, null, 2));
	} finally {
		await removeInstallRoots();
	}
}

async function removeInstallRoots() {
	for (const directory of [installRoot, `${installRoot}-recovery`]) {
		await fs.rm(directory, {
			recursive: true,
			force: true,
			maxRetries: 10,
			retryDelay: 100
		});
	}
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});
