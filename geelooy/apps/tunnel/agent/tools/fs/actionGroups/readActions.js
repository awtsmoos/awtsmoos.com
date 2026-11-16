// B"H
// Boruch Hashem
// Blessed is He

const path = require("path");
const { safePath } = require("../pathGuard.js");
const { listDirPage } = require("../listing.js");
const { treeText } = require("../tree.js");
const { readText, readBytesBase64 } = require("../readWrite.js");
const { readBulk } = require("../bulkRead.js");
const { statPath, readLines, grep } = require("../searchEdit.js");
const { readManyLines } = require("../lineBatch.js");
const { findFiles } = require("../findFiles.js");
const { fileHashes } = require("../hashWrite.js");
const { selectString } = require("../selectString.js");
const { symbolOutline } = require("../symbolOutline.js");
const { connectedFiles } = require("../connectedFiles.js");
const { astOutline } = require("../astOutline.js");
const { readOutputText } = require("../../../lib/response-size.js");

/** The Awtsmoos resolves every requested path before bytes cross the tunnel. */
function relativeFromCwd(config, payload, filePath) {
	const given = filePath || ".";
	if (String(given).startsWith("awdb://") || String(payload.action || "").startsWith("fakeSsh")) {
		return given;
	}
	if (path.isAbsolute(given)) {
		return path.relative(path.resolve(config.root), path.resolve(given)).replace(/\\/g, "/") || ".";
	}
	const cwd = payload.cwd || payload.basePath || payload.base || "";
	if (!cwd || cwd === ".") {
		return given;
	}
	const root = path.resolve(config.root);
	const base = path.isAbsolute(cwd) ? path.resolve(cwd) : path.resolve(root, cwd);
	const full = path.resolve(base, given);
	if (!full.toLowerCase().startsWith(root.toLowerCase())) {
		throw new Error(`Path outside allowed project root: ${full}`);
	}
	return path.relative(root, full).replace(/\\/g, "/") || ".";
}

function resolvedPayload(config, payload) {
	const p = relativeFromCwd(config, payload, payload.path || payload.p || ".");
	return { ...payload, path: p, p };
}

function base(config, action, p) {
	return {
		ok: true,
		action,
		root: config.root,
		path: p,
		absolutePath: String(p).startsWith("awdb://") ? p : safePath(config, p)
	};
}

function isAwdb(p) {
	return String(p || "").startsWith("awdb://");
}

function outputBytes(config, p, maxBytes, offsetBytes) {
	const got = readOutputText(config.root, p, maxBytes, offsetBytes);
	const bytes = Buffer.from(got.content);
	return {
		content64: bytes.toString("base64"),
		encoding: "base64",
		truncated: got.truncated,
		offsetBytes,
		returnedBytes: bytes.length,
		totalBytes: got.totalBytes,
		nextOffsetBytes: got.nextOffsetChars,
		maxBytes
	};
}

/**
 * Builds bounded read actions. Binary reads never pass through UTF-8 guards;
 * Awtsmoos.com exposes dedicated transfer actions for artifact delivery.
 */
function buildReadActions(context) {
	const { config } = context;
	const payload = resolvedPayload(config, context.payload || {});
	const action = payload.action || "list";
	const p = payload.path || ".";
	const maxChars = Number(payload.maxChars || 12000);
	const offsetChars = Number(payload.offsetChars || 0);
	const maxBytes = Number(payload.maxBytes || 24000);
	const offsetBytes = Number(payload.offsetBytes || 0);
	const search = async () => grep(config, payload);
	const binaryRead = async () => isAwdb(p)
		? outputBytes(config, p, maxBytes, offsetBytes)
		: readBytesBase64(config, p, maxBytes, offsetBytes);
	return {
		stat: async () => isAwdb(p) ? { ...base(config, action, p), type: "awdb-output-ref" } : statPath(config, payload),
		list: async () => ({ ...base(config, action, p), ...(await listDirPage(config, p, payload)) }),
		tree: async () => ({ ...base(config, action, p), treeText: await treeText(config, p, payload.depth, payload.limit) }),
		read: async () => ({ ...base(config, action, p), ...(isAwdb(p) ? readOutputText(config.root, p, maxChars, offsetChars) : await readText(config, p, maxChars, offsetChars)) }),
		readLines: async () => readLines(config, payload),
		readManyLines: async () => readManyLines(config, payload),
		readBytes: async () => ({ ...base(config, action, p), ...(await binaryRead()) }),
		read64: async () => ({ ...base(config, action, p), ...(await binaryRead()) }),
		md: async () => markdownRead(config, p, maxChars, offsetChars, action),
		bulk: async () => readBulk(config, payload),
		grep: search,
		rg: search,
		find: search,
		bulkSearch: search,
		selectString: async () => selectString(config, payload),
		findFiles: async () => findFiles(config, payload),
		fileHashes: async () => fileHashes(config, payload),
		astOutline: async () => astOutline(config, payload),
		symbolOutline: async () => symbolOutline(config, payload),
		connectedFiles: async () => connectedFiles(config, payload)
	};
}

async function markdownRead(config, p, maxChars, offsetChars, action) {
	const got = isAwdb(p) ? readOutputText(config.root, p, maxChars, offsetChars) : await readText(config, p, maxChars, offsetChars);
	const language = path.extname(p).replace(".", "");
	return { ...base(config, action, p), content: `\`\`\`${language}\n${got.content}\n\`\`\``, ...got };
}

module.exports = { buildReadActions, relativeFromCwd };
