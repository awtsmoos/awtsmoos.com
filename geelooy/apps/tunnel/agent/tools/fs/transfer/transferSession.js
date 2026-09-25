// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const { safePath, assertNotSecret } = require("../pathGuard.js");

/**
 * @file Durable chunked file-transfer sessions with resume, integrity, and conflict-safe commit.
 * @description
 * The Awtsmoos carries large files across an unreliable bridge without losing a
 * single byte or writing one twice. Awtsmoos.com keeps every transfer as a small
 * on-disk session beside its destination: chunk files land one at a time, each
 * verified by SHA-256 before it is accepted, and the final file is committed
 * atomically so an interrupted transfer can always resume instead of restarting.
 *
 * Design notes:
 * - Session state lives on disk (manifest.json + chunk files), never only in
 *   memory, so a child-process restart or a relay flap mid-transfer resumes
 *   from the manifest instead of from zero.
 * - Every chunk carries its own SHA-256. The server verifies the chunk before
 *   storing it; the assembled file's SHA-256 is verified before commit.
 * - The final commit uses hard-link with EEXIST retry, which is atomic: two
 *   concurrent transfers racing on the same destination name can never clobber
 *   each other, and conflict-safe "(2)" naming is applied without a TOCTOU gap.
 * - finalize() leaves a receipt so a retried finalize (new requestId after a
 *   flap) returns the identical result instead of failing or duplicating.
 */

const TRANSFER_ID_RE = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;
const SESSION_PREFIX = ".awtsmoos-transfer-";
const RECEIPT_SUFFIX = ".transfer-receipt.json";
const MANIFEST_NAME = "manifest.json";
const CHUNKS_DIR = "chunks";
const MANIFEST_VERSION = 1;
const MAX_CHUNK_BYTES = 8 * 1024 * 1024;
const DEFAULT_CHUNK_BYTES = 512 * 1024;
const STALE_SESSION_MS = 24 * 60 * 60 * 1000;
const RECEIPT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function sha256Hex(buffer) {
	return crypto.createHash("sha256").update(buffer).digest("hex");
}

function fail(code, message, extra = {}) {
	const error = new Error(message || code);
	error.code = code;
	Object.assign(error, extra);
	throw error;
}

function validateTransferId(transferId) {
	const id = String(transferId || "");
	if (!TRANSFER_ID_RE.test(id)) {
		fail("invalid_transfer_id", "transferId must be 1-64 chars of [A-Za-z0-9_-]");
	}
	return id;
}

function num(value, fallback) {
	const n = Number(value);
	return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

function hex(value) {
	return String(value || "").toLowerCase();
}

function assertHex64(value, field) {
	if (!/^[0-9a-f]{64}$/.test(hex(value))) {
		fail("invalid_sha256", `${field} must be a 64-char lowercase hex SHA-256`);
	}
	return hex(value);
}

/** Resolve the session directory beside the anchor path (dest for upload, source for download). */
function sessionPaths(config, anchorRelPath, transferId) {
	const id = validateTransferId(transferId);
	const anchorAbs = safePath(config, anchorRelPath);
	assertNotSecret(config, anchorAbs);
	const dirAbs = path.dirname(anchorAbs);
	const sessionAbs = path.join(dirAbs, SESSION_PREFIX + id);
	return { anchorAbs, dirAbs, sessionAbs, transferId: id };
}

function manifestPath(sessionAbs) {
	return path.join(sessionAbs, MANIFEST_NAME);
}

function receiptPath(dirAbs, transferId) {
	return path.join(dirAbs, SESSION_PREFIX + transferId + RECEIPT_SUFFIX);
}

async function readManifest(sessionAbs) {
	try {
		const raw = await fsp.readFile(manifestPath(sessionAbs), "utf8");
		const manifest = JSON.parse(raw);
		if (manifest && manifest.version === MANIFEST_VERSION && manifest.transferId) {
			return manifest;
		}
		return null;
	} catch (error) {
		if (error && (error.code === "ENOENT" || error instanceof SyntaxError)) return null;
		throw error;
	}
}

async function writeManifest(sessionAbs, manifest) {
	manifest.version = MANIFEST_VERSION;
	manifest.updatedAt = Date.now();
	const tmp = path.join(sessionAbs, MANIFEST_NAME + ".tmp");
	await fsp.writeFile(tmp, JSON.stringify(manifest));
	await fsp.rename(tmp, manifestPath(sessionAbs));
}

async function readReceipt(dirAbs, transferId) {
	try {
		const raw = await fsp.readFile(receiptPath(dirAbs, transferId), "utf8");
		return JSON.parse(raw);
	} catch (error) {
		return null;
	}
}

async function writeReceipt(dirAbs, transferId, receipt) {
	const tmp = receiptPath(dirAbs, transferId) + ".tmp";
	await fsp.writeFile(tmp, JSON.stringify({ ...receipt, transferId }));
	await fsp.rename(tmp, receiptPath(dirAbs, transferId));
}

/** Best-effort reaper: stale open sessions and expired receipts in one directory. */
async function sweepStale(dirAbs) {
	let entries;
	try {
		entries = await fsp.readdir(dirAbs);
	} catch (error) {
		return;
	}
	const now = Date.now();
	await Promise.all(entries.map(async entry => {
		try {
			if (entry.endsWith(RECEIPT_SUFFIX)) {
				const full = path.join(dirAbs, entry);
				const stat = await fsp.stat(full);
				if (now - stat.mtimeMs > RECEIPT_TTL_MS) await fsp.unlink(full);
				return;
			}
			if (!entry.startsWith(SESSION_PREFIX) || entry.endsWith(RECEIPT_SUFFIX)) return;
			const sessionAbs = path.join(dirAbs, entry);
			const manifest = await readManifest(sessionAbs);
			if (manifest && manifest.state === "open" && now - (manifest.updatedAt || 0) > STALE_SESSION_MS) {
				await fsp.rm(sessionAbs, { recursive: true, force: true });
			}
		} catch (error) {
			// Sweeping must never break a transfer.
		}
	}));
}

function missingRanges(receivedSet, chunkCount) {
	const missing = [];
	let start = -1;
	for (let i = 0; i < chunkCount; i++) {
		if (!receivedSet.has(i)) {
			if (start < 0) start = i;
		} else if (start >= 0) {
			missing.push(start === i - 1 ? [start] : [start, i - 1]);
			start = -1;
		}
	}
	if (start >= 0) missing.push(start === chunkCount - 1 ? [start] : [start, chunkCount - 1]);
	return missing;
}

/** macOS Finder-style conflict-safe name: "photo.png" -> "photo (2).png". */
function conflictFreeName(dirAbs, baseName) {
	const ext = path.extname(baseName);
	const stem = path.basename(baseName, ext) || baseName;
	let candidate = baseName;
	for (let n = 2; fs.existsSync(path.join(dirAbs, candidate)); n++) {
		candidate = `${stem} (${n})${ext}`;
	}
	return candidate;
}

async function hashFileStream(absolutePath) {
	return new Promise((resolve, reject) => {
		const hash = crypto.createHash("sha256");
		const stream = fs.createReadStream(absolutePath);
		stream.on("data", chunk => hash.update(chunk));
		stream.on("end", () => resolve(hash.digest("hex")));
		stream.on("error", reject);
	});
}

function requireWrite(config) {
	if (!config.tools || !config.tools.fsWrite) fail("fs_write_disabled", "fsWrite disabled.");
	if (!config.allowWrite) fail("writes_disabled", "Writes disabled.");
}

function requireRead(config) {
	if (!config.tools || !config.tools.fsRead) fail("fs_read_disabled", "fsRead disabled.");
}

function summarize(manifest) {
	const received = Object.keys(manifest.received || {}).map(Number).sort((a, b) => a - b);
	const receivedSet = new Set(received);
	return {
		transferId: manifest.transferId,
		direction: manifest.direction,
		state: manifest.state,
		totalSize: manifest.totalSize,
		chunkBytes: manifest.chunkBytes,
		chunkCount: manifest.chunkCount,
		receivedCount: received.length,
		complete: received.length === manifest.chunkCount,
		missing: missingRanges(receivedSet, manifest.chunkCount),
		createdAt: manifest.createdAt,
		updatedAt: manifest.updatedAt
	};
}

/**
 * Begin (or re-attach to) an upload session: VM -> Mac.
 * Idempotent: same transferId + same fingerprint resumes; same transferId +
 * different fingerprint is rejected so a stale client cannot corrupt a session.
 */
async function initUpload(config, payload = {}) {
	requireWrite(config);
	const { dirAbs, sessionAbs, transferId } = sessionPaths(
		config, payload.destPath || payload.path || payload.p, payload.transferId
	);
	const totalSize = num(payload.totalSize, -1);
	const chunkBytes = Math.min(
		num(payload.chunkBytes, DEFAULT_CHUNK_BYTES) || DEFAULT_CHUNK_BYTES,
		MAX_CHUNK_BYTES
	);
	const fileSha256 = assertHex64(payload.fileSha256 || payload.sha256, "fileSha256");
	const chunkHashes = Array.isArray(payload.chunkHashes) ? payload.chunkHashes.map(hex) : [];
	if (totalSize < 0) fail("missing_totalSize", "totalSize is required");
	if (!Number.isFinite(chunkBytes) || chunkBytes <= 0) fail("invalid_chunkBytes", "chunkBytes must be positive");

	await sweepStale(dirAbs);

	const receipt = await readReceipt(dirAbs, transferId);
	if (receipt && receipt.fileSha256 === fileSha256 && receipt.totalSize === totalSize) {
		return { ok: true, action: "transferInit", alreadyFinalized: true, ...receipt };
	}

	const existing = await readManifest(sessionAbs);
	if (existing && existing.direction === "upload") {
		if (existing.totalSize === totalSize &&
			existing.chunkBytes === chunkBytes &&
			existing.fileSha256 === fileSha256) {
			const summary = summarize(existing);
			return {
				ok: true, action: "transferInit", resumed: true,
				path: existing.reservedRel, ...summary
			};
		}
		fail("transfer_fingerprint_mismatch",
			"A session with this transferId exists for a different file. Abort it first.",
			{ transferId });
	}

	const chunkCount = Math.max(1, Math.ceil(totalSize / chunkBytes));
	if (chunkHashes.length && chunkHashes.length !== chunkCount) {
		fail("chunk_hash_count_mismatch", "chunkHashes length must equal chunkCount");
	}
	chunkHashes.forEach(h => assertHex64(h, "chunkHashes[]"));

	const destBase = path.basename(safePath(config, payload.destPath || payload.path || payload.p));
	let reservedName = destBase;
	const destAbs = path.join(dirAbs, destBase);
	if (fs.existsSync(destAbs)) {
		const stat = await fsp.stat(destAbs);
		if (stat.isFile() && stat.size === totalSize) {
			const actual = await hashFileStream(destAbs);
			if (actual === fileSha256) {
				return {
					ok: true, action: "transferInit", alreadyExists: true,
					path: path.relative(path.resolve(config.root), destAbs).replace(/\\/g, "/"),
					bytes: stat.size, sha256: actual, verified: true
				};
			}
		}
		reservedName = conflictFreeName(dirAbs, destBase);
	}

	await fsp.mkdir(path.join(sessionAbs, CHUNKS_DIR), { recursive: true });
	const manifest = {
		transferId,
		direction: "upload",
		state: "open",
		destDirRel: path.relative(path.resolve(config.root), dirAbs).replace(/\\/g, "/") || ".",
		reservedRel: ((path.relative(path.resolve(config.root), dirAbs).replace(/\\/g, "/") || ".") + "/" + reservedName).replace(/^\.\//, ""),
		reservedName,
		totalSize,
		chunkBytes,
		chunkCount,
		fileSha256,
		chunkHashes,
		received: {},
		createdAt: Date.now()
	};
	await writeManifest(sessionAbs, manifest);
	const summary = summarize(manifest);
	return { ok: true, action: "transferInit", resumed: false, path: manifest.reservedRel, ...summary };
}

/** Store one verified chunk of an upload. Idempotent per index. */
async function putChunk(config, payload = {}) {
	requireWrite(config);
	const { dirAbs, sessionAbs, transferId } = sessionPaths(
		config, payload.destPath || payload.path || payload.p || payload.anchorPath,
		payload.transferId
	);
	const manifest = await readManifest(sessionAbs);
	if (!manifest || manifest.direction !== "upload") {
		const receipt = await readReceipt(dirAbs, transferId);
		if (receipt) {
			return { ok: true, action: "transferChunk", alreadyFinalized: true, index: num(payload.index, 0) };
		}
		fail("unknown_transfer", "No open upload session for this transferId. Call transferInit first.", { transferId });
	}
	if (manifest.state !== "open") fail("transfer_not_open", `Session is ${manifest.state}`, { transferId });

	const index = num(payload.index, -1);
	if (index < 0 || index >= manifest.chunkCount) fail("chunk_index_out_of_range", `index must be 0..${manifest.chunkCount - 1}`);
	const expectedHash = manifest.chunkHashes[index] || hex(payload.chunkSha256);
	const data = Buffer.from(String(payload.data || payload.data64 || ""), "base64");
	if (!data.length && manifest.totalSize > 0) fail("empty_chunk", "Chunk data is empty");
	if (data.length > MAX_CHUNK_BYTES) fail("chunk_too_large", `Chunk exceeds ${MAX_CHUNK_BYTES} bytes`);
	const actualHash = sha256Hex(data);
	assertHex64(payload.chunkSha256 || expectedHash, "chunkSha256");
	if (actualHash !== hex(payload.chunkSha256 || expectedHash)) {
		fail("chunk_hash_mismatch", `Chunk ${index} failed integrity check`, {
			transferId, index, expectedSha256: hex(payload.chunkSha256 || expectedHash), actualSha256: actualHash
		});
	}
	if (expectedHash && actualHash !== expectedHash) {
		fail("chunk_hash_mismatch", `Chunk ${index} does not match the manifest`, { transferId, index });
	}
	const isLast = index === manifest.chunkCount - 1;
	const expectedLen = isLast
		? manifest.totalSize - manifest.chunkBytes * (manifest.chunkCount - 1)
		: manifest.chunkBytes;
	if (data.length !== expectedLen) {
		fail("chunk_length_mismatch", `Chunk ${index} should be ${expectedLen} bytes, got ${data.length}`, { transferId, index });
	}

	const final = path.join(sessionAbs, CHUNKS_DIR, String(index));
	if (!manifest.received[index]) {
		const tmp = final + ".tmp";
		await fsp.writeFile(tmp, data);
		await fsp.rename(tmp, final);
		manifest.received[index] = actualHash;
		await writeManifest(sessionAbs, manifest);
	}
	const summary = summarize(manifest);
	return { ok: true, action: "transferChunk", index, chunkSha256: actualHash, ...summary };
}

/**
 * Begin (or re-attach to) a download session: Mac -> VM.
 * Streams the source file's SHA-256 once at init so the client can verify
 * the assembled file end-to-end.
 */
async function initDownload(config, payload = {}) {
	requireRead(config);
	const anchor = payload.sourcePath || payload.path || payload.p;
	const { dirAbs, sessionAbs, transferId } = sessionPaths(config, anchor, payload.transferId);
	const chunkBytes = Math.min(
		num(payload.chunkBytes, DEFAULT_CHUNK_BYTES) || DEFAULT_CHUNK_BYTES,
		MAX_CHUNK_BYTES
	);
	await sweepStale(dirAbs);

	const sourceAbs = safePath(config, anchor);
	assertNotSecret(config, sourceAbs);
	const stat = await fsp.stat(sourceAbs);
	if (!stat.isFile()) fail("not_a_file", "Download source must be a regular file");

	const existing = await readManifest(sessionAbs);
	if (existing && existing.direction === "download") {
		if (existing.totalSize === stat.size && existing.mtimeMs === stat.mtimeMs) {
			const summary = summarize(existing);
			return {
				ok: true, action: "transferInit", resumed: true,
				path: existing.sourceRel, fileSha256: existing.fileSha256, mtimeMs: stat.mtimeMs, ...summary
			};
		}
		fail("source_changed", "The source file changed since the session started. Abort and re-init.", { transferId });
	}

	const fileSha256 = await hashFileStream(sourceAbs);
	const chunkCount = Math.max(1, Math.ceil(stat.size / chunkBytes));
	await fsp.mkdir(sessionAbs, { recursive: true });
	const manifest = {
		transferId,
		direction: "download",
		state: "open",
		sourceRel: path.relative(path.resolve(config.root), sourceAbs).replace(/\\/g, "/"),
		totalSize: stat.size,
		mtimeMs: stat.mtimeMs,
		fileSha256,
		chunkBytes,
		chunkCount,
		chunkHashes: [],
		received: {},
		createdAt: Date.now()
	};
	await writeManifest(sessionAbs, manifest);
	const summary = summarize(manifest);
	return {
		ok: true, action: "transferInit", resumed: false,
		path: manifest.sourceRel, fileSha256, mtimeMs: stat.mtimeMs, ...summary
	};
}

/** Fetch one chunk of a download, with its SHA-256 for mid-stream verification. */
async function getChunk(config, payload = {}) {
	requireRead(config);
	const anchor = payload.sourcePath || payload.path || payload.p || payload.anchorPath;
	const { sessionAbs, transferId } = sessionPaths(config, anchor, payload.transferId);
	const manifest = await readManifest(sessionAbs);
	if (!manifest || manifest.direction !== "download") {
		fail("unknown_transfer", "No open download session for this transferId. Call transferInit first.", { transferId });
	}
	const index = num(payload.index, -1);
	if (index < 0 || index >= manifest.chunkCount) fail("chunk_index_out_of_range", `index must be 0..${manifest.chunkCount - 1}`);

	const sourceAbs = safePath(config, manifest.sourceRel);
	const stat = await fsp.stat(sourceAbs);
	if (stat.size !== manifest.totalSize || stat.mtimeMs !== manifest.mtimeMs) {
		fail("source_changed", "The source file changed mid-transfer. Abort and re-init.", { transferId });
	}
	const offset = index * manifest.chunkBytes;
	const length = Math.min(manifest.chunkBytes, manifest.totalSize - offset);
	const handle = await fsp.open(sourceAbs, "r");
	let data;
	try {
		data = Buffer.alloc(length);
		await handle.read(data, 0, length, offset);
	} finally {
		await handle.close();
	}
	const chunkSha256 = sha256Hex(data);
	manifest.received[index] = chunkSha256;
	await writeManifest(sessionAbs, manifest).catch(() => {});
	return {
		ok: true, action: "transferChunk",
		index, offset, length,
		data64: data.toString("base64"),
		chunkSha256,
		fileSha256: manifest.fileSha256,
		totalSize: manifest.totalSize,
		chunkCount: manifest.chunkCount
	};
}

async function transferStatus(config, payload = {}) {
	const anchor = payload.destPath || payload.sourcePath || payload.path || payload.p || payload.anchorPath;
	if (!anchor) fail("missing_path", "path (or destPath/sourcePath) is required");
	const { dirAbs, sessionAbs, transferId } = sessionPaths(config, anchor, payload.transferId);
	const manifest = await readManifest(sessionAbs);
	if (manifest) {
		const summary = summarize(manifest);
		return {
			ok: true, action: "transferStatus", found: true,
			path: manifest.reservedRel || manifest.sourceRel,
			fileSha256: manifest.fileSha256, ...summary
		};
	}
	const receipt = await readReceipt(dirAbs, transferId);
	if (receipt) {
		return { ok: true, action: "transferStatus", found: true, alreadyFinalized: true, ...receipt };
	}
	return { ok: true, action: "transferStatus", found: false, transferId };
}

/**
 * Assemble, verify, and atomically commit an upload; close a download session.
 * The commit is atomic via hard-link: on EEXIST the conflict-safe name is
 * bumped and retried, so concurrent transfers never clobber each other.
 */
async function finalizeTransfer(config, payload = {}) {
	const direction = String(payload.direction || "");
	const anchor = payload.destPath || payload.sourcePath || payload.path || payload.p || payload.anchorPath;
	if (!anchor) fail("missing_path", "path (or destPath/sourcePath) is required");
	const { dirAbs, sessionAbs, transferId } = sessionPaths(config, anchor, payload.transferId);

	const receipt = await readReceipt(dirAbs, transferId);
	if (receipt) {
		return { ok: true, action: "transferFinalize", alreadyFinalized: true, ...receipt };
	}
	const manifest = await readManifest(sessionAbs);
	if (!manifest) fail("unknown_transfer", "No session for this transferId.", { transferId });
	if (manifest.direction !== direction && direction) {
		fail("direction_mismatch", `Session is ${manifest.direction}`, { transferId });
	}

	if (manifest.direction === "download") {
		await fsp.rm(sessionAbs, { recursive: true, force: true });
		return { ok: true, action: "transferFinalize", direction: "download", transferId, closed: true };
	}

	requireWrite(config);
	if (manifest.state !== "open") fail("transfer_not_open", `Session is ${manifest.state}`, { transferId });
	const summary = summarize(manifest);
	if (!summary.complete) {
		fail("transfer_incomplete", `${summary.missing.length} chunk range(s) still missing`, {
			transferId, receivedCount: summary.receivedCount, chunkCount: summary.chunkCount, missing: summary.missing
		});
	}

	const tmpAbs = path.join(sessionAbs, "assembled.tmp");
	const out = fs.createWriteStream(tmpAbs);
	const hash = crypto.createHash("sha256");
	let bytes = 0;
	try {
		for (let i = 0; i < manifest.chunkCount; i++) {
			const chunkAbs = path.join(sessionAbs, CHUNKS_DIR, String(i));
			const data = await fsp.readFile(chunkAbs);
			const want = manifest.chunkHashes[i];
			if (want && sha256Hex(data) !== want) {
				fail("chunk_corrupt_on_disk", `Stored chunk ${i} no longer matches its hash`, { transferId, index: i });
			}
			hash.update(data);
			bytes += data.length;
			await new Promise((resolve, reject) => out.write(data, error => error ? reject(error) : resolve()));
		}
	} finally {
		await new Promise(resolve => out.end(resolve));
	}
	const assembledSha256 = hash.digest("hex");
	if (bytes !== manifest.totalSize || assembledSha256 !== manifest.fileSha256) {
		await fsp.unlink(tmpAbs).catch(() => {});
		fail("transfer_corrupt", "Assembled file failed final integrity verification", {
			transferId, expectedSha256: manifest.fileSha256, actualSha256: assembledSha256,
			expectedBytes: manifest.totalSize, actualBytes: bytes
		});
	}

	// Atomic commit: hard-link wins the name; EEXIST bumps the conflict-safe suffix.
	let finalName = manifest.reservedName;
	let finalAbs = path.join(dirAbs, finalName);
	for (let attempt = 0; attempt < 1000; attempt++) {
		try {
			fs.linkSync(tmpAbs, finalAbs);
			break;
		} catch (error) {
			if (error && error.code === "EEXIST") {
				finalName = conflictFreeName(dirAbs, bumpBase(finalName));
				finalAbs = path.join(dirAbs, finalName);
				continue;
			}
			throw error;
		}
	}
	await fsp.unlink(tmpAbs).catch(() => {});
	const finalRel = (path.relative(path.resolve(config.root), finalAbs).replace(/\\/g, "/"));

	const result = {
		action: "transferFinalize",
		direction: "upload",
		transferId,
		path: finalRel,
		bytes,
		sha256: assembledSha256,
		verified: true,
		conflictRenamed: finalName !== manifest.reservedName,
		finalizedAt: Date.now()
	};
	await writeReceipt(dirAbs, transferId, {
		path: finalRel, bytes, sha256: assembledSha256, verified: true,
		fileSha256: manifest.fileSha256, totalSize: manifest.totalSize,
		finalizedAt: result.finalizedAt
	});
	await fsp.rm(sessionAbs, { recursive: true, force: true });
	return { ok: true, ...result };
}

function bumpBase(name) {
	// "photo (2).png" -> "photo (3).png"; "photo.png" -> "photo (2).png"
	const ext = path.extname(name);
	const stem = path.basename(name, ext);
	const m = stem.match(/^(.*) \((\d+)\)$/);
	if (m) return `${m[1]} (${Number(m[2]) + 1})${ext}`;
	return `${stem} (2)${ext}`;
}

async function abortTransfer(config, payload = {}) {
	const anchor = payload.destPath || payload.sourcePath || payload.path || payload.p || payload.anchorPath;
	if (!anchor) fail("missing_path", "path (or destPath/sourcePath) is required");
	const { dirAbs, sessionAbs, transferId } = sessionPaths(config, anchor, payload.transferId);
	await fsp.rm(sessionAbs, { recursive: true, force: true }).catch(() => {});
	await fsp.unlink(receiptPath(dirAbs, transferId)).catch(() => {});
	return { ok: true, action: "transferAbort", transferId, aborted: true };
}

module.exports = {
	DEFAULT_CHUNK_BYTES,
	MAX_CHUNK_BYTES,
	abortTransfer,
	finalizeTransfer,
	getChunk,
	initDownload,
	initUpload,
	putChunk,
	transferStatus
};
