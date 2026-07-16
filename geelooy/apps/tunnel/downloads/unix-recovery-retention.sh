#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Archive metadata retains the established recovery-reader contract while also
# publishing bounded inventory and artifact measurements for newer tooling.
write_archive_metadata() {
	local archive_dir="${1:?Archive directory is required.}"
	local version="${2:-unknown}"
	local reason="${3:-known_good_before_activation}"
	local archive_sha
	local manifest_sha
	local archive_bytes
	archive_sha="$(sha256_file "$archive_dir/runtime.tar")"
	manifest_sha="$(cat "$ROOT/install-manifest.sha256" 2>/dev/null | awk '{print $1}')"
	archive_bytes="$(wc -c < "$archive_dir/runtime.tar" | tr -d '[:space:]')"

	node - "$archive_dir/metadata.json" "$archive_dir/archive.json" \
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
fs.writeFileSync(metadataFile, `${JSON.stringify({
	version,
	createdAt,
	reason,
	archiveSha256: artifactSha256,
	manifestSha256
}, null, 2)}\n`);
fs.writeFileSync(archiveFile, `${JSON.stringify({
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
}, null, 2)}\n`);
NODE
}

prune_recovery_versions() {
	node - "$RECOVERY_ROOT/versions" \
		"${AWTSMOOS_ARCHIVE_KEEP:-${AWTSMOOS_RECOVERY_KEEP:-5}}" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
const root = process.argv[2];
const keep = Math.max(2, Number(process.argv[3] || 5));
if (!fs.existsSync(root)) process.exit(0);
const entries = fs.readdirSync(root, { withFileTypes: true })
	.filter(entry => entry.isDirectory() && !entry.name.startsWith("."))
	.map(entry => path.join(root, entry.name))
	.sort()
	.reverse();
for (const directory of entries.slice(keep)) {
	fs.rmSync(directory, { recursive: true, force: true });
}
NODE
}

prune_known_good_archives() {
	prune_recovery_versions
}

verify_archive_artifact() {
	local archive_dir="$1"
	local expected_sha
	local actual_sha
	expected_sha="$(node - "$archive_dir" <<'NODE'
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
	actual_sha="$(sha256_file "$archive_dir/runtime.tar")"
	[ -n "$expected_sha" ] && [ "$expected_sha" = "$actual_sha" ]
}
