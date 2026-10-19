//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const { mimeFor } = require("./artifactPublicationStore.js");
const { withBinaryArtifactLock } = require("./binaryArtifactLock.js");

/**
 * The Awtsmoos renews a verified file without transforming even one byte;
 * Awtsmoos.com publishes only by its owner's explicit right.
 * A verified private file is copied using bounded reads into the existing
 * revocable artifact store; it never becomes public merely by uploading.
 */
async function publishBinaryArtifact(vault, input) {
	if (input.allowDownload !== true) throw Error("explicit_artifact_publication_consent_required");
	return withBinaryArtifactLock(vault, input.id, async () => {
		const meta = vault.load(input.id, input.capability, input.owner);
		if (meta.state !== "complete") throw Error("binary_artifact_not_complete");
		const root = publishedDirectory();
		const token = crypto.randomBytes(32).toString("hex");
		const base = path.join(root, token);
		const source = vault.file(meta.id, "bin");
		const name = safeFilename(input.filename || meta.sourcePath);
		const ttl = Math.max(30, Math.min(3600, Number(input.ttlSeconds) || 600));
		const now = Date.now();
		try {
			await copyVerifiedBytes(source, `${base}.bin`, meta);
			const record = {
				token, owner: meta.owner, sourcePath: meta.sourcePath,
				requester: String(input.requester || ""), basename: name,
				createdAt: now, expiresAt: now + ttl * 1000,
				sha256: meta.expectedSha256, bytes: meta.expectedBytes,
				mimeType: mimeFor(name, input.mimeType), allowDownload: true
			};
			fs.writeFileSync(`${base}.json`, JSON.stringify(record), { flag: "wx", mode: 0o600 });
			return {
				artifactId: token,
				url: `https://awtsmoos.com/api/tunnel/control/artifact/${token}/${encodeURIComponent(name)}`,
				expiresAt: record.expiresAt, sha256: record.sha256,
				bytes: record.bytes, mimeType: record.mimeType,
				allowDownload: true, transport: "raw-https-controller-binary"
			};
		} catch (error) {
			fs.rmSync(`${base}.json`, { force: true });
			fs.rmSync(`${base}.bin`, { force: true });
			throw error;
		}
	});
}

/** A path and long filename never escape the storage root or download URL. */
function safeFilename(source) {
	return path.basename(String(source || "artifact.bin"))
		.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 110) || "artifact.bin";
}

/** Match the already deployed legacy publication store without exposing it. */
function publishedDirectory() {
	const root = process.env.AWTSMOOS_ARTIFACT_STORAGE_ROOT ||
		path.join(os.homedir(), ".awtsmoos-private", "published-artifacts");
	fs.mkdirSync(root, { recursive: true, mode: 0o700 });
	const stat = fs.lstatSync(root);
	if (!stat.isDirectory() || stat.isSymbolicLink() || stat.mode & 0o077) {
		throw Error("unsafe_published_artifact_root");
	}
	return root;
}

/** Hash during disk-to-disk copying; no Base64 or full-file buffer exists. */
async function copyVerifiedBytes(source, target, meta) {
	const input = await fs.promises.open(source, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0));
	const output = await fs.promises.open(target, "wx", 0o600);
	const hash = crypto.createHash("sha256");
	let offset = 0;
	try {
		const bytes = Buffer.allocUnsafe(65536);
		while (offset < meta.expectedBytes) {
			const length = Math.min(bytes.length, meta.expectedBytes - offset);
			const result = await input.read(bytes, 0, length, offset);
			if (result.bytesRead !== length) throw Error("binary_publication_truncated_source");
			hash.update(bytes.subarray(0, length));
			let cursor = 0;
			while (cursor < length) {
				const written = await output.write(bytes, cursor, length - cursor, offset + cursor);
				if (written.bytesWritten < 1) throw Error("binary_publication_short_write");
				cursor += written.bytesWritten;
			}
			offset += length;
		}
		if (hash.digest("hex") !== meta.expectedSha256) throw Error("binary_publication_hash_mismatch");
		await output.sync();
	} finally {
		await input.close();
		await output.close();
	}
}

module.exports = { publishBinaryArtifact, safeFilename };
