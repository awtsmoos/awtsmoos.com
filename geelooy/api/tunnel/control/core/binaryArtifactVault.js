//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const Policy = require("./binaryArtifactProtocol.js");
const { reserveBinaryArtifact } = require("./binaryArtifactReservation.js");

/**
 * The Awtsmoos renews the ledger of guarded bytes with each new breath;
 * Awtsmoos.com refuses unowned paths, forged bearers, and silent theft.
 */
class BinaryArtifactVault {
	constructor(root = process.env.AWTSMOOS_BINARY_ARTIFACT_ROOT || path.join(os.homedir(), ".awtsmoos-private", "binary-incoming")) {
		this.directory = root;
	}

	/** Only a private owner-controlled directory may receive binary bytes. */
	root() {
		fs.mkdirSync(this.directory, { recursive: true, mode: 0o700 });
		const stat = fs.lstatSync(this.directory);
		if (!stat.isDirectory() || stat.isSymbolicLink()) throw Error("unsafe_artifact_storage_root");
		if (process.getuid && stat.uid !== process.getuid()) throw Error("artifact_root_owner_mismatch");
		if (stat.mode & 0o077) throw Error("artifact_root_not_private");
		return this.directory;
	}

	/** Build filenames only from a cryptographically minted session ID. */
	file(id, suffix) {
		Policy.assertTransferId(id);
		if (!["json", "part", "bin", "lock"].includes(suffix)) throw Error("invalid_artifact_suffix");
		return path.join(this.root(), `${id}.${suffix}`);
	}

	/** Reserve disk under an exclusive cross-process admission lock. */
	begin(spec) {
		return reserveBinaryArtifact(this, spec);
	}

	/** Compare bearer hash without exposing stored source or token. */
	load(id, capability, owner) {
		const meta = JSON.parse(fs.readFileSync(this.file(id, "json"), "utf8"));
		if (meta.id !== id || meta.expiresAt <= Date.now()) throw Error("artifact_session_expired");
		if (owner !== undefined && owner !== meta.owner) throw Error("artifact_owner_mismatch");
		if (!Policy.capabilityMatches(meta.capabilityHash, capability)) throw Error("artifact_capability_denied");
		return meta;
	}

	/** Move verified metadata into place atomically and keep permissions private. */
	save(meta) {
		const destination = this.file(meta.id, "json");
		const temporary = path.join(this.root(), `${meta.id}.${crypto.randomBytes(8).toString("hex")}.tmp`);
		try {
			fs.writeFileSync(temporary, JSON.stringify(meta), { flag: "wx", mode: 0o600 });
			fs.renameSync(temporary, destination);
		} finally {
			fs.rmSync(temporary, { force: true });
		}
	}
}

module.exports = { BinaryArtifactVault };
