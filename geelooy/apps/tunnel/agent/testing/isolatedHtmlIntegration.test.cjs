// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const installRoot = path.join(os.tmpdir(), `awtsmoos-isolated-install-${process.pid}`);
process.env.AWTSMOOS_INSTALL_ROOT = installRoot;

const { findChrome } = require("../tools/chrome/finder.js");
const ChromeProcesses = require("../tools/chrome/processes.js");
const { isolatedHtmlTest } = require("../tools/fs/isolatedHtml.js");

async function run() {
	if (!findChrome()) {
		console.log(JSON.stringify({
			ok: true,
			suite: "isolated-html-integration",
			skipped: true,
			reason: "chrome_not_installed"
		}, null, 2));
		return;
	}
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "awtsmoos-isolated-root-"));
	try {
		const result = await isolatedHtmlTest(
			{ root, allowWrite: true, allowCommands: true },
			{
				html: "<!doctype html><title>Isolated proof</title>"
					+ "<link rel=\"icon\" href=\"data:,\">"
					+ "<main id=\"proof\">B'H fully isolated</main>",
				selector: "#proof",
				assertNoConsoleErrors: true,
				timeoutMs: 20000
			}
		);
		assert.equal(result.ok, true, JSON.stringify(result));
		assert.equal(result.browser.autoLaunched, true);
		assert.equal(result.browser.selectorFound, true);
		assert.equal(result.browser.errorCount, 0);
		assert.equal(await ChromeProcesses.waitForClosed(result.browser.port, 3000), true);
		await new Promise(resolve => setTimeout(resolve, 500));
		await assert.rejects(fs.stat(result.sandbox), { code: "ENOENT" });
		await assert.rejects(fetch(result.server.url));

		console.log(JSON.stringify({
			ok: true,
			suite: "isolated-html-integration",
			sandboxInsideProject: result.sandbox.startsWith(root + path.sep),
			browserAutoLaunched: true,
			selectorFound: true,
			serverStopped: true,
			browserStopped: true,
			sandboxRemoved: true
		}, null, 2));
	} finally {
		await fs.rm(root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
		await fs.rm(installRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
	}
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});
