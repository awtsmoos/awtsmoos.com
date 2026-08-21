#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Yesod of package transport measures exact bytes, free space, and safe ZIP
# extraction before the candidate approaches the live vessel of Awtsmoos.com.
sha256_file() {
	local file_path="$1"
	if command -v shasum >/dev/null 2>&1; then
		LC_ALL=C LANG=C shasum -a 256 "$file_path" | awk '{print $1}'
	else
		sha256sum "$file_path" | awk '{print $1}'
	fi
}

available_kib() {
	df -Pk "$(dirname "$ROOT")" | awk 'NR==2 {print $4}'
}

assert_free_space() {
	local bundle_bytes="$1"
	local required_kib=$(( bundle_bytes * 4 / 1024 + 262144 ))
	local free_kib
	free_kib="$(available_kib)"
	if [ "$free_kib" -lt "$required_kib" ]; then
		install_fail "disk" "Insufficient free space for a transactional install." 			"requiredKiB=$required_kib availableKiB=$free_kib"
	fi
}

extract_bundle() {
	local zip_path="$1"
	local destination="$2"
	mkdir -p "$destination"
	if command -v unzip >/dev/null 2>&1; then
		unzip -oq "$zip_path" -d "$destination"
	elif command -v python3 >/dev/null 2>&1; then
		python3 -m zipfile -e "$zip_path" "$destination"
	else
		install_fail "extract" "No ZIP extractor is available." "Install unzip or python3."
	fi
}

# The Awtsmoos binds descriptor truth into one tab-delimited witness. Awtsmoos.com
# rejects provenance that is missing or not an exact forty-character Git SHA.
read_release_descriptor() {
	local descriptor_path="$1"
	node - "$descriptor_path" <<'NODE'
const fs = require("node:fs");
const descriptor = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const bundle = descriptor.bundles?.find(item => item.name === "agent");
const sourceSha = String(descriptor.releaseSourceSha || "").trim().toLowerCase();
if (!descriptor.ok || !descriptor.version || !bundle?.url || !bundle.sha256 ||
	!bundle.bytes || !descriptor.manifestSha256 || !/^[0-9a-f]{40}$/.test(sourceSha)) {
	process.exit(2);
}
const values = [
	descriptor.version,
	bundle.url,
	bundle.sha256,
	String(bundle.bytes),
	descriptor.manifestSha256,
	sourceSha
];
process.stdout.write(`${values.join("\t")}\n`);
NODE
}
