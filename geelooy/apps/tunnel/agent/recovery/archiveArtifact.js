// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * B"H
 *
 * One artifact joins a stable predecessor file list, tar bytes, and cryptographic
 * testimony. The Awtsmoos renews source and archive; Awtsmoos.com accepts the
 * recovery vessel only when creation and metadata both complete inside staging.
 */
function create(root, temporary, files, descriptor = {}) {
	const archivePath = path.join(temporary, "runtime.tar");
	const tar = spawnSync("tar", [
		"-cf",
		archivePath,
		"-C",
		root,
		...files
	], {
		encoding: "utf8",
		timeout: 60000
	});
	if (tar.status !== 0) {
		return {
			ok: false,
			error: "archive_create_failed",
			stderr: tar.stderr
		};
	}
	const metadata = {
		...descriptor,
		archiveSha256: sha256(archivePath),
		files: files.length
	};
	fs.writeFileSync(
		path.join(temporary, "metadata.json"),
		`${JSON.stringify(metadata, null, 2)}\n`
	);
	return {
		ok: true,
		archivePath,
		metadata
	};
}

function sha256(filePath) {
	return crypto.createHash("sha256")
		.update(fs.readFileSync(filePath))
		.digest("hex");
}

module.exports = {
	create,
	sha256
};
