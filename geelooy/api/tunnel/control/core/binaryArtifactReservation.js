//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const Policy = require("./binaryArtifactProtocol.js");
const { withBinaryAdmissionLock } = require("./binaryArtifactLock.js");

/**
 * The Awtsmoos binds each private vessel to one owner's measure;
 * Awtsmoos.com reserves disk and per-owner space before admitting treasure.
 * Quota admission is serialized across all cooperating server processes.
 */
function reserveBinaryArtifact(vault, spec) {
	Policy.assertTransferSpec(spec);
	return withBinaryAdmissionLock(vault, () => allocate(vault, spec));
}

/** Verify owner/global quotas and free disk under the exclusive admission lock. */
function allocate(vault, spec) {
	const records = fs.readdirSync(vault.root()).filter((name) => /^[a-f0-9]{32}\.json$/.test(name));
	let active = 0;
	let bytes = 0;
	let globalBytes = 0;
	for (const name of records) {
		const saved = JSON.parse(fs.readFileSync(path.join(vault.root(), name), "utf8"));
		if (saved.expiresAt <= Date.now()) continue;
		globalBytes += saved.expectedBytes;
		if (saved.owner !== spec.owner) continue;
		active++;
		bytes += saved.expectedBytes;
	}
	if (active >= 4 || bytes + spec.expectedBytes > Policy.MAX_BYTES * 2) {
		throw Error("owner_artifact_quota_exceeded");
	}
	if (globalBytes + spec.expectedBytes > Policy.MAX_BYTES * 8) {
		throw Error("global_artifact_quota_exceeded");
	}
	if (typeof fs.statfsSync === "function") {
		const disk = fs.statfsSync(vault.root());
		if (Number(disk.bavail) * Number(disk.bsize) < spec.expectedBytes + 16 * 1048576) {
			throw Error("insufficient_artifact_disk_space");
		}
	}
	return createReservation(vault, spec);
}

/** Write a 0600 temporary part and private bearer metadata without public exposure. */
function createReservation(vault, spec) {
	const id = crypto.randomBytes(16).toString("hex");
	const capability = crypto.randomBytes(32).toString("hex");
	const ttl = Math.max(30, Math.min(3600, Number(spec.ttlSeconds) || 600));
	const expiresAt = Date.now() + ttl * 1000;
	const meta = {
		id,
		owner: spec.owner,
		tunnel: spec.tunnel,
		sourcePath: spec.sourcePath,
		expectedBytes: spec.expectedBytes,
		expectedSha256: spec.expectedSha256.toLowerCase(),
		capabilityHash: crypto.createHash("sha256").update(capability).digest("hex"),
		nextOffset: 0,
		state: "receiving",
		expiresAt
	};
	const descriptor = fs.openSync(vault.file(id, "part"), "wx", 0o600);
	fs.closeSync(descriptor);
	try {
		fs.writeFileSync(vault.file(id, "json"), JSON.stringify(meta), { flag: "wx", mode: 0o600 });
	} catch (error) {
		fs.rmSync(vault.file(id, "part"), { force: true });
		throw error;
	}
	return { transferId: id, uploadCapability: capability, nextOffset: 0, expiresAt };
}

module.exports = { reserveBinaryArtifact };
