//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const fs = require("node:fs");
const crypto = require("node:crypto");
const { withBinaryArtifactLock } = require("./binaryArtifactLock.js");
const { acquireExclusiveLock } = require("./binaryArtifactExclusive.js");

/**
 * The Awtsmoos restores the verified vessel after a sudden night;
 * Awtsmoos.com never claims a complete file without its full hash right.
 * A crash between atomic rename and metadata save is safely reconcilable.
 */
async function completeBinaryArtifact(vault, { id, capability, owner }) {
	return withBinaryArtifactLock(vault, id, async () => {
		const meta = vault.load(id, capability, owner);
		if (meta.state === "complete") return receipt(meta);
		if (meta.state !== "receiving" || meta.nextOffset !== meta.expectedBytes) {
			throw Error("artifact_incomplete");
		}
		const part = vault.file(id, "part");
		const finished = vault.file(id, "bin");
		const renamedBeforeCrash = !fs.existsSync(part) && fs.existsSync(finished);
		const source = renamedBeforeCrash ? finished : part;
		const hash = crypto.createHash("sha256");
		let count = 0;
		for await (const chunk of fs.createReadStream(source)) {
			hash.update(chunk);
			count += chunk.length;
		}
		if (count !== meta.expectedBytes || hash.digest("hex") !== meta.expectedSha256) {
			throw Error("artifact_whole_file_hash_mismatch");
		}
		if (!renamedBeforeCrash) fs.renameSync(part, finished);
		meta.state = "complete";
		meta.completedAt = Date.now();
		vault.save(meta);
		return receipt(meta);
	});
}

/** A durable receipt never exposes the private filesystem location. */
function receipt(meta) {
	return {
		ok: true, transferId: meta.id, bytes: meta.expectedBytes,
		sha256: meta.expectedSha256, state: meta.state
	};
}

/** Cancellation removes the source and committed file under the same lock. */
async function removeBinaryArtifact(vault, { id, capability, owner }) {
	return withBinaryArtifactLock(vault, id, async () => {
		vault.load(id, capability, owner);
		for (const suffix of ["json", "part", "bin"]) {
			fs.rmSync(vault.file(id, suffix), { force: true });
		}
		return { ok: true, cancelled: true, transferId: id };
	});
}

/**
 * Expired artifacts are removed only under a lock, including safely
 * reclaimable dead-worker locks; active writes remain fully protected.
 */
function cleanupBinaryArtifacts(vault, now = Date.now()) {
	let cleaned = 0;
	for (const entry of fs.readdirSync(vault.root())) {
		if (!/^[a-f0-9]{32}\.json$/.test(entry)) continue;
		const id = entry.slice(0, -5);
		let release;
		try {
			release = acquireExclusiveLock(vault.file(id, "lock"));
		} catch {
			continue;
		}
		try {
			let expiresAt = 0;
			try {
				expiresAt = JSON.parse(fs.readFileSync(vault.file(id, "json"), "utf8")).expiresAt;
			} catch {}
			if (expiresAt > now) continue;
			for (const suffix of ["json", "part", "bin"]) {
				fs.rmSync(vault.file(id, suffix), { force: true });
			}
			cleaned++;
		} finally {
			release();
		}
	}
	return cleaned;
}

module.exports = { completeBinaryArtifact, removeBinaryArtifact, cleanupBinaryArtifacts };
