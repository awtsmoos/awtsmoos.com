#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos gives Gevurah to every archive and remembers the Node vessel outside PATH;
# Awtsmoos.com rejects unsafe worlds before they can cross the living recovery path.
recovery_node_bin() {
	local remembered="$RECOVERY_ROOT/state/node-bin.path"
	local candidate=""
	if [ -n "${AWTSMOOS_NODE_BIN:-}" ] && [ -x "$AWTSMOOS_NODE_BIN" ]; then
		printf '%s\n' "$AWTSMOOS_NODE_BIN"
		return 0
	fi
	if [ -f "$remembered" ]; then
		candidate="$(cat "$remembered" 2>/dev/null || true)"
		if [ -x "$candidate" ]; then
			printf '%s\n' "$candidate"
			return 0
		fi
	fi
	command -v node 2>/dev/null
}

log_recovery() {
	local outcome="$1"
	local message="$2"
	local detail="${3:-}"
	local node_bin="$(recovery_node_bin 2>/dev/null || true)"
	mkdir -p "$(dirname "$LOG")"
	printf '[Awtsmoos][recovery][%s] %s\n' "$outcome" "$message"
	if [ -z "$node_bin" ]; then
		return 0
	fi
	"$node_bin" - "$LOG" "$outcome" "$message" "$detail" "$TIER" <<'NODE'
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
	local node_bin="$(recovery_node_bin 2>/dev/null || true)"
	if [ -z "$node_bin" ]; then
		return 1
	fi
	if ! tar -tf "$archive" > "$listing" 2>/dev/null; then
		rm -f "$listing"
		return 1
	fi
	if ! "$node_bin" - "$listing" <<'NODE'
const fs = require("node:fs");
const entries = fs.readFileSync(process.argv[2], "utf8").split(/\r?\n/).filter(Boolean);
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
	local node_bin="$(recovery_node_bin 2>/dev/null || true)"
	if [ -z "$node_bin" ]; then
		return 1
	fi
	if [ -f "$runtime_root/scripts/install-probe.cjs" ]; then
		"$node_bin" "$runtime_root/scripts/install-probe.cjs" "$runtime_root" >/dev/null 2>&1
		return $?
	fi
	"$node_bin" - "$runtime_root" <<'NODE' >/dev/null 2>&1
const path = require("node:path");
const root = process.argv[2];
require(path.join(root, "lib", "local-api.js"));
require(path.join(root, "lib", "runtime", "main-dependencies.js"));
NODE
}
