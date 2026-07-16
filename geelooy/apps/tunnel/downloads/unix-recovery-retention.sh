#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Recovery retention favors a small, verified archive ladder and keeps inventory
# metrics beside every artifact so Awtsmoos.com can prove archive cost before tar.
prune_known_good_archives() {
	local keep="${AWTSMOOS_ARCHIVE_KEEP:-5}"
	local index=0
	[ -d "$RECOVERY_ROOT/versions" ] || return 0
	while IFS= read -r archive; do
		index=$((index + 1))
		if [ "$index" -gt "$keep" ]; then
			rm -rf "$archive"
		fi
	done < <(archive_directories_newest)
}

write_archive_metadata() {
	local archive_dir="$1"
	local runtime_root="$2"
	local version="$3"
	local manifest_sha="$4"
	local artifact_sha="$5"
	local artifact_bytes="$6"
	node - "$archive_dir/archive.json" "$archive_dir/inventory.json" \
		"$runtime_root" "$version" "$manifest_sha" "$artifact_sha" \
		"$artifact_bytes" <<'NODE'
const fs = require("node:fs");
const [file, inventoryFile, runtimeRoot, version, manifestSha256, artifactSha256, bytes] = process.argv.slice(2);
let inventory = null;
try {
	inventory = JSON.parse(fs.readFileSync(inventoryFile, "utf8"));
} catch {}
const descriptor = {
	kind: "awtsmoos-runtime-archive",
	version,
	createdAt: new Date().toISOString(),
	sourceRoot: runtimeRoot,
	artifact: "runtime.tar",
	artifactSha256,
	artifactBytes: Number(bytes),
	manifestSha256,
	inventory,
	state: "sealed"
};
fs.writeFileSync(file, `${JSON.stringify(descriptor, null, 2)}\n`);
NODE
}

verify_archive_artifact() {
	local archive_dir="$1"
	local expected_sha
	local actual_sha
	expected_sha="$(node -e "const v=require(process.argv[1]);process.stdout.write(v.artifactSha256||'')" "$archive_dir/archive.json")"
	actual_sha="$(sha256_file "$archive_dir/runtime.tar")"
	[ -n "$expected_sha" ] && [ "$expected_sha" = "$actual_sha" ]
}
