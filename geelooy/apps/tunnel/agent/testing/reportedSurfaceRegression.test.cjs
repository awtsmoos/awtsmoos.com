// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { handleBulkWrite } = require("../tools/fs/actionGroups/writeActions.js");
const { fileHashes } = require("../tools/fs/file-hash.js");
const { nodeCheckMany } = require("../tools/fs/nodeCheckMany.js");
const { buildPreviewActions } = require("../tools/fs/actionGroups/previewActions.js");
const { sandboxPath } = require("../tools/fs/isolatedHtml.js");
const Chrome = require("../tools/chrome/actions.js");
const { fsSchema } = require("../lib/tool-schema/fs.js");
const { chromeSchema } = require("../lib/tool-schema/nonfs.js");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-reported-surface-"));
const config = {
	root,
	allowWrite: true,
	allowCommands: true,
	tools: { fsBulk: true, fsWrite: true, fsRead: true }
};

async function run() {
	let previewServer = null;
	try {
		const writes = Array.from({ length: 45 }, (_, index) => ({
			path: `nested/group-${index % 5}/file-${index}.js`,
			content: `module.exports = ${index};\n`
		}));
		const bulk = await handleBulkWrite(config, {
			writes,
			verifyRuntime: false
		}, "bulkWrite");
		assert.equal(bulk.ok, true, JSON.stringify(bulk));
		assert.equal(bulk.count, 45);
		assert.equal(bulk.okCount, 45);
		assert.deepEqual(bulk.order, writes.map(item => item.path));
		for (const item of writes) {
			assert.equal(fs.readFileSync(path.join(root, item.path), "utf8"), item.content);
		}

		const pathsJson = JSON.stringify(writes.map(item => item.path));
		const hashes = await fileHashes(config, { paths: pathsJson });
		assert.equal(hashes.ok, true);
		assert.equal(hashes.count, 45);
		assert.equal(hashes.requestedCount, 45);
		assert.equal(hashes.partial, false);
		assert.deepEqual(Object.keys(hashes.results), writes.map(item => item.path));

		const firstPage = await fileHashes(config, { files: pathsJson, pageSize: 17 });
		assert.equal(firstPage.count, 17);
		assert.equal(firstPage.partial, true);
		assert.equal(firstPage.nextCursor, 17);
		const secondPage = await fileHashes(config, firstPage.nextPayload);
		assert.equal(secondPage.cursor, 17);
		assert.equal(secondPage.count, 17);

		const checked = await nodeCheckMany(config, {
			files: JSON.stringify(writes.slice(0, 12).map(item => item.path)),
			maxFiles: 20
		});
		assert.equal(checked.ok, true, JSON.stringify(checked));
		assert.equal(checked.count, 12);

		previewServer = http.createServer((request, response) => {
			response.writeHead(200, { "content-type": "application/json" });
			response.end('{"ok":true}');
		});
		await new Promise(resolve => previewServer.listen(0, "127.0.0.1", resolve));
		const sourceUrl = `http://127.0.0.1:${previewServer.address().port}/health`;
		const preview = await buildPreviewActions({
			payload: { url: sourceUrl }
		}).previewPage();
		assert.equal(preview.ok, true);
		assert.equal(preview.action, "previewPage");
		assert.equal(preview.sourceUrl, sourceUrl);
		assert.equal(preview.preview.kind, "proxy");
		assert.equal(preview.sourceProbe.ok, true);
		assert.equal(preview.sourceProbe.status, 200);
		assert.notEqual(preview.url, sourceUrl);

		assert.equal(Chrome.urlOf({ href: "https://example.test/a" }), "https://example.test/a");
		assert.equal(Chrome.urlOf({ targetUrl: "https://example.test/b" }), "https://example.test/b");
		assert.equal(Chrome.expressionOf({ text: "2 + 2" }), "2 + 2");
		assert.equal(Chrome.expressionOf({ command: "3 + 3" }), "3 + 3");

		const sandbox = sandboxPath(config, "proof");
		assert.equal(path.relative(root, sandbox).startsWith(".."), false);
		assert.equal(fsSchema("nodeCheckMany").properties.files.type, "string");
		assert.equal(fsSchema("portKillSafe").properties.confirm.type, "boolean");
		assert.equal(chromeSchema("chromeEval").properties.command.type, "string");
		assert.equal(chromeSchema("chromeEval").properties.engine.type, "string");
		assert.equal(chromeSchema("chromeEval").properties.html.type, "string");
		assert.equal(chromeSchema("chromeEval").properties.virtualDom.type, "boolean");
		assert.equal(chromeSchema("chromeNavigate").properties.href.type, "string");

		console.log(JSON.stringify({
			ok: true,
			suite: "reported-surface-regression",
			bulkFiles: bulk.count,
			hashFiles: hashes.count,
			nodeChecked: checked.count,
			previewUrlPreserved: true,
			chromeAliases: true,
			sandboxInsideRoot: true
		}, null, 2));
	} finally {
		if (previewServer) await new Promise(resolve => previewServer.close(resolve));
		fs.rmSync(root, { recursive: true, force: true });
	}
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});
