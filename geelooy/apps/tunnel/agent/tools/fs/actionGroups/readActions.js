// B"H
const path = require("path");
const { safePath } = require("../pathGuard.js");
const { listDirDetailed } = require("../listing.js");
const { treeText } = require("../tree.js");
const { readText, readBytesBase64, readTextFromBytes } = require("../readWrite.js");
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

function relativeFromCwd(config, payload, filePath) {
	const given = filePath || "."; if (String(given).startsWith("awdb://")) return given;
	if (String(payload.action || "").startsWith("fakeSsh")) return given;
	if (path.isAbsolute(given)) return path.relative(path.resolve(config.root), path.resolve(given)).replace(/\\/g, "/") || ".";
	const cwd = payload.cwd || payload.basePath || payload.base || ""; if (!cwd || cwd === ".") return given;
	const root = path.resolve(config.root), base = path.isAbsolute(cwd) ? path.resolve(cwd) : path.resolve(root, cwd), full = path.resolve(base, given);
	if (!full.toLowerCase().startsWith(root.toLowerCase())) throw new Error(`Path outside allowed project root: ${full}`);
	return path.relative(root, full).replace(/\\/g, "/") || ".";
}

function withResolvedPath(config, payload) { const p = relativeFromCwd(config, payload, payload.path || payload.p || "."); return { ...payload, path: p, p }; }
function base(config, action, p) { return { ok:true, action, root:config.root, path:p, absolutePath:String(p).startsWith("awdb://") ? p : safePath(config, p) }; }
function isAwdb(p) { return String(p || "").startsWith("awdb://"); }
function buildReadActions(ctx) {
	const { config } = ctx, payload = withResolvedPath(config, ctx.payload || {}), action = payload.action || "list", p = payload.path || ".";
	const maxChars = Number(payload.maxChars || 12000), offsetChars = Number(payload.offsetChars || 0), maxBytes = Number(payload.maxBytes || 24000), offsetBytes = Number(payload.offsetBytes || 0);
	const search = async () => grep(config, payload);
	return {
		async stat() { return isAwdb(p) ? { ...base(config, action, p), type:"awdb-output-ref" } : statPath(config, payload); },
		async list() { const detailedItems = await listDirDetailed(config, p); return { ...base(config, action, p), items:detailedItems.map(x => x.isDirectory ? `${x.name}/` : x.name), detailedItems }; },
		async tree() { return { ...base(config, action, p), treeText:await treeText(config, p, payload.depth, payload.limit) }; },
		async read() { return { ...base(config, action, p), ...(isAwdb(p) ? readOutputText(config.root, p, maxChars, offsetChars) : await readText(config, p, maxChars, offsetChars)) }; },
		async readLines() { return readLines(config, payload); }, async readManyLines() { return readManyLines(config, payload); },
		async readBytes() { return { ...base(config, action, p), ...(await readTextFromBytes(config, p, maxBytes, offsetBytes)) }; },
		async read64() { if (isAwdb(p)) { const got = readOutputText(config.root, p, maxBytes, offsetBytes); return { ...base(config, action, p), content64:Buffer.from(got.content).toString("base64"), encoding:"base64", truncated:got.truncated, offsetBytes, returnedBytes:Buffer.byteLength(got.content), totalBytes:got.totalBytes, nextOffsetBytes:got.nextOffsetChars, maxBytes }; } return { ...base(config, action, p), ...(await readBytesBase64(config, p, maxBytes, offsetBytes)) }; },
		async md() { const got = isAwdb(p) ? readOutputText(config.root, p, maxChars, offsetChars) : await readText(config, p, maxChars, offsetChars); const lang = path.extname(p).replace(".", ""); return { ...base(config, action, p), content:`\`\`\`${lang}\n${got.content}\n\`\`\``, ...got }; },
		async bulk() { return readBulk(config, payload); }, grep:search, rg:search, find:search, bulkSearch:search,
		async selectString() { return selectString(config, payload); }, async findFiles() { return findFiles(config, payload); },
		async fileHashes() { return fileHashes(config, payload); }, async astOutline() { return astOutline(config, payload); },
		async symbolOutline() { return symbolOutline(config, payload); }, async connectedFiles() { return connectedFiles(config, payload); }
	};
}

/** B"H: virtual fake SSH paths may pass through action construction without unsafe local cwd confusion. */
module.exports = { buildReadActions, relativeFromCwd };
