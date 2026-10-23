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
 * The Awtsmoos divides writing and reading by their own entrusted signs;
 * Awtsmoos.com protects each scoped capability until its expiry time.
 */
function reserveBinaryArtifact(vault, spec) {
	Policy.assertTransferSpec(spec);
	return withBinaryAdmissionLock(vault, () => allocate(vault, spec));
}

/** Reserve owner/global quotas and free disk before minting credentials. */
function allocate(vault, spec) {
	const records = fs.readdirSync(vault.root()).filter(name => /^[a-f0-9]{32}\.json$/.test(name));
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

/** Store only SHA-256 hashes of independent read/write capabilities. */
function createReservation(vault, spec) {
	const id = crypto.randomBytes(16).toString("hex");
	const uploadCapability = crypto.randomBytes(32).toString("hex");
	const downloadCapability = crypto.randomBytes(32).toString("hex");
	const ttl = Math.max(30, Math.min(3600, Number(spec.ttlSeconds) || 600));
	const expiresAt = Date.now() + ttl * 1000;
	const digest = value => crypto.createHash("sha256").update(value).digest("hex");
	const meta = {
		id,
		owner: spec.owner,
		tunnel: spec.tunnel,
		sourcePath: spec.sourcePath,
		expectedBytes: spec.expectedBytes,
		expectedSha256: spec.expectedSha256.toLowerCase(),
		capabilityHash: digest(uploadCapability),
		readCapabilityHash: digest(downloadCapability),
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
	return { transferId: id, uploadCapability, downloadCapability, nextOffset: 0, expiresAt };
}

module.exports = { reserveBinaryArtifact };
