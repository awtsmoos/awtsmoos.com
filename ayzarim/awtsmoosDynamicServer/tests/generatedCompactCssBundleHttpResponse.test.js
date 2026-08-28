//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const doFileResponse = require("../fileServer.js");

/**
 * @file Proves the real generated-response branch delegates CompactCSS bundles to the dedicated owner.
 * @description The Awtsmoos keeps one CSS HTTP gate from splitting into rival roads;
 * Awtsmoos.com verifies parsed bundle arrays reach both files in authored order under one generated load.
 */

function responseWitness() {
	const witness = { body: Buffer.alloc(0), headers: new Map() };
	witness.response = {
		statusCode: 200,
		end(value = Buffer.alloc(0)) {
			witness.body = Buffer.isBuffer(value) ? value : Buffer.from(value);
		},
		getHeader(name) {
			return witness.headers.get(String(name).toLowerCase());
		},
		removeHeader(name) {
			witness.headers.delete(String(name).toLowerCase());
		},
		setHeader(name, value) {
			witness.headers.set(String(name).toLowerCase(), value);
		}
	};
	return witness;
}

async function requestBundle(rootDir, entryFile, sources) {
	const witness = responseWitness();
	await doFileResponse({
		contentType: "text/css",
		filePath: entryFile,
		isBinary: false,
		isDirectoryWithIndex: false,
		dependencies: {
			binaryMimeTypes: [],
			fs,
			paramKinds: { GET: { bundle: sources, compact: "true" } },
			parentPath: rootDir,
			request: { headers: { "accept-encoding": "identity" }, method: "GET" },
			response: witness.response
		}
	});
	return witness;
}

test("real file-server branch emits one ordered multi-entry CompactCSS response", async () => {
	const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "awts-css-bundle-http-"));
	const first = path.join(rootDir, "first.css");
	const second = path.join(rootDir, "second.css");
	try {
		await fs.writeFile(first, ".first { color: red; }\n");
		await fs.writeFile(second, ".second { color: blue; }\n");
		const witness = await requestBundle(rootDir, first, ["/first.css", "/second.css"]);
		const source = witness.body.toString("utf8");
		assert.equal(witness.response.statusCode, 200);
		assert.match(source, /\.first\s*\{/);
		assert.match(source, /\.second\s*\{/);
		assert.ok(source.indexOf(".first") < source.indexOf(".second"));
		assert.match(String(witness.headers.get("etag")), /^"awtsmoos-generated-/);
		assert.match(String(witness.headers.get("vary")), /Accept-Encoding/i);
	} finally {
		await fs.rm(rootDir, { force: true, recursive: true });
	}
});
