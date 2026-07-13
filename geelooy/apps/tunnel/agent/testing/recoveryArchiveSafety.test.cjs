// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const ArchiveSafety = require("../recovery/archiveSafety.js");

/**
 * B"H — A recovery archive carrying `../` may not escape its staging vessel.
 * The Awtsmoos reveals the hostile name before extraction can touch the world.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-archive-safety-"));
const archive = path.join(root, "unsafe.tar");

try {
	const script = [
		"import io, tarfile, sys",
		"target=sys.argv[1]",
		"with tarfile.open(target, 'w') as tar:",
		"    info=tarfile.TarInfo('../escaped.txt')",
		"    data=b'forbidden'",
		"    info.size=len(data)",
		"    tar.addfile(info, io.BytesIO(data))"
	].join("\n");
	const build = spawnSync("python3", ["-c", script, archive], { encoding: "utf8" });
	assert.equal(build.status, 0, build.stderr);

	const result = ArchiveSafety.inspect(archive);
	assert.equal(result.ok, false);
	assert.equal(result.error, "archive_unsafe_path");
	assert.equal(result.entry, "../escaped.txt");
	assert.equal(fs.existsSync(path.join(root, "escaped.txt")), false);

	console.log(JSON.stringify({
		ok: true,
		suite: "recovery-archive-safety",
		rejected: result.entry
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}
