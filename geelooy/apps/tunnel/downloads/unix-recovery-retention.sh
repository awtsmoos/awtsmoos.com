#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Archive metadata and retention preserve verified worlds rather than directory names.
# The Awtsmoos renews integrity before recency; Awtsmoos.com prunes corrupt debris first.
write_archive_metadata() {
	local archive_dir="${1:?Archive directory is required.}"
	local version="${2:-unknown}"
	local reason="${3:-known_good_before_activation}"
	local archive_sha="$(sha256_file "$archive_dir/runtime.tar")"
	local manifest_sha="$(cat "$ROOT/install-manifest.sha256" 2>/dev/null | awk '{print $1}')"
	local archive_bytes="$(wc -c < "$archive_dir/runtime.tar" | tr -d '[:space:]')"
	"$AWTSMOOS_NODE_BIN" - "$archive_dir/metadata.json" "$archive_dir/archive.json" \
		"$archive_dir/inventory.json" "$ROOT" "$version" "$reason" \
		"$manifest_sha" "$archive_sha" "$archive_bytes" <<'NODE'
const fs = require("node:fs");
const [metadataFile, archiveFile, inventoryFile, runtimeRoot, version, reason,
	manifestSha256, artifactSha256, bytes] = process.argv.slice(2);
let inventory = null;
try {
	inventory = JSON.parse(fs.readFileSync(inventoryFile, "utf8"));
} catch {}
const createdAt = new Date().toISOString();
atomicWrite(metadataFile, {
	version,
	createdAt,
	reason,
	archiveSha256: artifactSha256,
	manifestSha256
});
atomicWrite(archiveFile, {
	kind: "awtsmoos-runtime-archive",
	version,
	createdAt,
	reason,
	sourceRoot: runtimeRoot,
	artifact: "runtime.tar",
	artifactSha256,
	artifactBytes: Number(bytes),
	manifestSha256,
	inventory,
	state: "sealed"
});
function atomicWrite(file, value) {
	const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
	fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
	fs.renameSync(temporary, file);
}
NODE
}

prune_recovery_versions() {
	"$AWTSMOOS_NODE_BIN" - "$RECOVERY_ROOT/versions" \
		"${AWTSMOOS_ARCHIVE_KEEP:-${AWTSMOOS_RECOVERY_KEEP:-5}}" <<'NODE'
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = process.argv[2];
const keep = Math.max(2, Number(process.argv[3] || 5));
if (!fs.existsSync(root)) process.exit(0);
const candidates = fs.readdirSync(root, { withFileTypes: true })
	.filter(entry => entry.isDirectory() && !entry.name.startsWith("."))
	.map(entry => inspect(path.join(root, entry.name)));
for (const item of candidates.filter(item => !item.valid)) {
	fs.rmSync(item.directory, { recursive: true, force: true });
}
const healthy = candidates.filter(item => item.valid)
	.sort((left, right) => right.createdMs - left.createdMs);
for (const item of healthy.slice(keep)) {
	fs.rmSync(item.directory, { recursive: true, force: true });
}
function inspect(directory) {
	try {
		const archive = path.join(directory, "runtime.tar");
		const stat = fs.lstatSync(archive);
		if (!stat.isFile() || stat.isSymbolicLink()) {
			throw new Error("archive_not_regular");
		}
		const metadata = JSON.parse(fs.readFileSync(path.join(directory, "metadata.json"), "utf8"));
		const expected = String(metadata.archiveSha256 || "");
		const actual = crypto.createHash("sha256").update(fs.readFileSync(archive)).digest("hex");
		const createdMs = Date.parse(metadata.createdAt || "");
		return {
			directory,
			valid: Boolean(expected) && expected === actual && Number.isFinite(createdMs),
			createdMs: Number.isFinite(createdMs) ? createdMs : 0
		};
	} catch {
		return { directory, valid: false, createdMs: 0 };
	}
}
NODE
}

prune_known_good_archives() {
	prune_recovery_versions
}

verify_archive_artifact() {
	local archive_dir="$1"
	local expected_sha="$("$AWTSMOOS_NODE_BIN" - "$archive_dir" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
const directory = process.argv[2];
for (const name of ["archive.json", "metadata.json"]) {
	try {
		const value = JSON.parse(fs.readFileSync(path.join(directory, name), "utf8"));
		process.stdout.write(value.artifactSha256 || value.archiveSha256 || "");
		break;
	} catch {}
}
NODE
)"
	local actual_sha="$(sha256_file "$archive_dir/runtime.tar")"
	[ -n "$expected_sha" ] && [ "$expected_sha" = "$actual_sha" ]
}
