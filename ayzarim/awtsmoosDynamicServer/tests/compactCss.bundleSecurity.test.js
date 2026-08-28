//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const doFileResponse = require("../fileServer.js");
const { parseStylesheetBundle } = require("../compactCss/bundleCodec.js");
const { compactCssBundleOptions } = require("../compactCss/bundleRequest.js");

/**
 * @file Attacks CompactCSS bundle boundaries before compiler or cache custody may begin.
 * @description The Awtsmoos grants every fast road a guarded gate; Awtsmoos.com rejects crooked bundle paths,
 * then proves a valid ordered cascade still flows cleanly after every hostile shape meets its fate.
 */

function bundleContext(rootDir, entryFile, bundle) {
	return {
		filePath: entryFile,
		dependencies: {
			parentPath: rootDir,
			paramKinds: { GET: { bundle, compact: "true" } },
			request: { method: "GET", yeser: {} }
		}
	};
}

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

test("bundle codec rejects malformed, undersized, oversized, and non-string identities", () => {
	assert.throws(() => parseStylesheetBundle("not-json"));
	assert.throws(() => parseStylesheetBundle([]));
	assert.throws(() => parseStylesheetBundle(["/one.css"]));
	assert.throws(() => parseStylesheetBundle(Array.from({ length: 65 }, (_, index) => `/${index}.css`)));
	assert.throws(() => parseStylesheetBundle(["/one.css", 7]));
});

test("bundle request rejects recursion, non-CSS, root escape, and anchor mismatch", async () => {
	const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "awts-css-bundle-guard-"));
	const first = path.join(rootDir, "first.css");
	const second = path.join(rootDir, "second.css");
	try {
		await fs.writeFile(first, ".first { color: red; }\n");
		await fs.writeFile(second, ".second { color: blue; }\n");
		assert.throws(() => compactCssBundleOptions(bundleContext(rootDir, first, ["/first.css?bundle=%5B%5D", "/second.css"])));
		assert.throws(() => compactCssBundleOptions(bundleContext(rootDir, first, ["/first.css", "/second.js"])));
		assert.throws(() => compactCssBundleOptions(bundleContext(rootDir, first, ["/first.css", "/../escape.css"])));
		assert.throws(() => compactCssBundleOptions(bundleContext(rootDir, first, ["/second.css", "/first.css"])));
	} finally {
		await fs.rm(rootDir, { force: true, recursive: true });
	}
});

test("hostile rejection cannot poison a following valid real file-server bundle", async () => {
	const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "awts-css-bundle-recovery-"));
	const first = path.join(rootDir, "first.css");
	const second = path.join(rootDir, "second.css");
	try {
		await fs.writeFile(first, ".first { order: 1; }\n");
		await fs.writeFile(second, ".second { order: 2; }\n");
		assert.throws(() => compactCssBundleOptions(bundleContext(rootDir, first, ["/first.css", "/../escape.css"])));
		const witness = responseWitness();
		await doFileResponse({
			contentType: "text/css",
			filePath: first,
			isBinary: false,
			isDirectoryWithIndex: false,
			dependencies: {
				binaryMimeTypes: [],
				fs,
				paramKinds: { GET: { bundle: ["/first.css", "/second.css"], compact: "true" } },
				parentPath: rootDir,
				request: { headers: { "accept-encoding": "identity" }, method: "GET" },
				response: witness.response
			}
		});
		const source = witness.body.toString("utf8");
		assert.match(source, /\.first\s*\{/);
		assert.match(source, /\.second\s*\{/);
		assert.ok(source.indexOf(".first") < source.indexOf(".second"));
	} finally {
		await fs.rm(rootDir, { force: true, recursive: true });
	}
});
