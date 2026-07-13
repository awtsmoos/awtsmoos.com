#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# B"H
# Metadata and bounded retention give Netzach memory without unbounded disk use.
write_archive_metadata() {
	local temporary="$1"
	local version="$2"
	local reason="$3"
	local archive_sha
	local manifest_sha
	archive_sha="$(sha256_file "$temporary/runtime.tar")"
	manifest_sha="$(cat "$ROOT/install-manifest.sha256" 2>/dev/null | awk '{print $1}')"

	node - "$temporary/metadata.json" "$version" "$reason" \
		"$archive_sha" "$manifest_sha" <<'NODE'
const fs = require("node:fs");
const [file, version, reason, archiveSha256, manifestSha256] = process.argv.slice(2);
fs.writeFileSync(file, `${JSON.stringify({
	version,
	createdAt: new Date().toISOString(),
	reason,
	archiveSha256,
	manifestSha256
}, null, 2)}\n`);
NODE
}

prune_recovery_versions() {
	node - "$RECOVERY_ROOT/versions" "${AWTSMOOS_RECOVERY_KEEP:-5}" <<'NODE'
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
