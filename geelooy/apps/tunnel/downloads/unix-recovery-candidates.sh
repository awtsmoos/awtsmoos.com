#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Candidate order is preference, never an idol. The Awtsmoos renews each older
# world; Awtsmoos.com skips a bounded archive offset after failed registrations.

candidate_lines() {
	node - "$RECOVERY_ROOT/versions" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
const root = process.argv[2];
if (!fs.existsSync(root)) process.exit(0);
const candidates = fs.readdirSync(root, { withFileTypes: true })
	.filter(entry => entry.isDirectory() && !entry.name.startsWith("."))
	.flatMap(entry => {
		const directory = path.join(root, entry.name);
		try {
			const metadata = JSON.parse(fs.readFileSync(path.join(directory, "metadata.json"), "utf8"));
			return fs.existsSync(path.join(directory, "runtime.tar"))
				? [{ directory, ...metadata }]
				: [];
		} catch {
			return [];
		}
	})
	.sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
for (const item of candidates) {
	process.stdout.write(`${item.directory}\t${item.version}\t${item.archiveSha256}\n`);
}
NODE
}

select_candidate() {
	local tab
	local directory
	local version
	local expected_sha
	local archive
	local actual_sha
	local healthy_index=0
	local offset="${TIER:-0}"
	tab="$(printf '\t')"
	while IFS="$tab" read -r directory version expected_sha; do
		[ -n "$directory" ] || continue
		archive="$directory/runtime.tar"
		actual_sha="$(recovery_sha256_file "$archive" 2>/dev/null || true)"
		if [ -z "$expected_sha" ] || [ "$actual_sha" != "$expected_sha" ]; then
			log_recovery "rejected" "Recovery archive checksum mismatch." "$directory"
			continue
		fi
		if ! archive_is_safe "$archive"; then
			log_recovery "rejected" \
				"Recovery archive is unreadable or contains an unsafe path." "$directory"
			continue
		fi
		if [ "$healthy_index" -lt "$offset" ]; then
			healthy_index=$(( healthy_index + 1 ))
			continue
		fi
		rm -rf "$STAGE"
		mkdir -p "$STAGE"
		if ! tar -xf "$archive" -C "$STAGE"; then
			log_recovery "rejected" "Recovery archive could not be extracted." "$directory"
			continue
		fi
		[ -f "$ROOT/config.json" ] && cp -p "$ROOT/config.json" "$STAGE/config.json"
		if ! probe_recovery_runtime "$STAGE"; then
			log_recovery "rejected" "Recovery candidate failed its startup probe." "$directory"
			continue
		fi
		SELECTED_VERSION="$version"
		SELECTED_DIRECTORY="$directory"
		return 0
	done < <(candidate_lines)
	return 1
}
