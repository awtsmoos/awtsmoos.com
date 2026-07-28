#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# B"H
# This Gevurah vessel judges hashes, archive paths, and startup imports before
# any recovery candidate can approach the live path of Awtsmoos.com.
log_recovery() {
	local outcome="$1"
	local message="$2"
	local detail="${3:-}"
	mkdir -p "$(dirname "$LOG")"
	printf '[Awtsmoos][recovery][%s] %s\n' "$outcome" "$message"

	node - "$LOG" "$outcome" "$message" "$detail" "$TIER" <<'NODE'
const fs = require("node:fs");
const [file, outcome, message, detail, tier] = process.argv.slice(2);
fs.appendFileSync(file, `${JSON.stringify({
	at: new Date().toISOString(),
	outcome,
	message,
	detail,
	tier: Number(tier)
})}\n`);
NODE
}

recovery_sha256_file() {
	if command -v shasum >/dev/null 2>&1; then
		LC_ALL=C LANG=C shasum -a 256 "$1" | awk '{print $1}'
	else
		sha256sum "$1" | awk '{print $1}'
	fi
}

archive_is_safe() {
	local archive="$1"
	local listing="${STAGE}.archive-list-$$"

	if ! tar -tf "$archive" > "$listing" 2>/dev/null; then
		rm -f "$listing"
		return 1
	fi

	if ! node - "$listing" <<'NODE'
const fs = require("node:fs");
const entries = fs.readFileSync(process.argv[2], "utf8")
	.split(/\r?\n/)
	.filter(Boolean);
const unsafe = entries.some(entry => {
	const normalized = entry.replace(/\\/g, "/");
	return normalized.startsWith("/") || normalized.split("/").includes("..");
});
process.exit(unsafe ? 1 : 0);
NODE
	then
		rm -f "$listing"
		return 1
	fi

	rm -f "$listing"
}

probe_recovery_runtime() {
	local runtime_root="$1"

	if [ -f "$runtime_root/scripts/install-probe.cjs" ]; then
		node "$runtime_root/scripts/install-probe.cjs" "$runtime_root" >/dev/null 2>&1
		return $?
	fi

	node - "$runtime_root" <<'NODE' >/dev/null 2>&1
const path = require("node:path");
const root = process.argv[2];
require(path.join(root, "lib", "local-api.js"));
require(path.join(root, "lib", "runtime", "main-dependencies.js"));
NODE
}
