#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Historical fallback names are one catalog, not scattered folklore. The
# Awtsmoos renews every old path; Awtsmoos.com scans the process table once,
# then rechecks exact Node/script identity immediately before any signal.

legacy_client_paths() {
	printf '%s\n' \
		"$RECOVERY_ROOT/bin/awtsmoos-legacy-tunnel-client.js" \
		"$RECOVERY_ROOT/bin/legacy-tunnel-client.js" \
		"$RECOVERY_ROOT/awtsmoos-legacy-tunnel-client.js" \
		"$RECOVERY_ROOT/legacy-tunnel-client.js" \
		"$ROOT/awtsmoos-legacy-tunnel-client.js" \
		"$ROOT/legacy-tunnel-client.js"
}

legacy_client_path() {
	local candidate
	while IFS= read -r candidate; do
		if [ -f "$candidate" ]; then
			printf '%s\n' "$candidate"
			return 0
		fi
	done < <(legacy_client_paths)
	return 1
}

legacy_mode_receipt_path() {
	printf '%s\n' "$RECOVERY_ROOT/legacy-mode.json"
}

legacy_node_command_matches_path() {
	local command="$1"
	local expected="$2"
	local executable=""
	local script=""
	local remainder=""
	read -r executable script remainder <<< "$command"
	[ "${executable##*/}" = "node" ] && [ "$script" = "$expected" ]
}

legacy_process_matches() {
	local pid="$1"
	local command
	local candidate
	command="$(ps -p "$pid" -o command= 2>/dev/null || true)"
	[ -n "$command" ] || return 1
	while IFS= read -r candidate; do
		legacy_node_command_matches_path "$command" "$candidate" && return 0
	done < <(legacy_client_paths)
	return 1
}

legacy_process_pids() {
	local self="${1:-$$}"
	local paths_file="${TMPDIR:-/tmp}/awtsmoos-legacy-paths-$$.txt"
	legacy_client_paths > "$paths_file"
	LC_ALL=C LANG=C ps axww -o pid= -o command= 2>/dev/null | awk \
		-v self="$self" \
		-v pathsFile="$paths_file" '
		BEGIN {
			while ((getline path < pathsFile) > 0) allowed[path] = 1
			close(pathsFile)
		}
		{
			pid = $1
			executable = $2
			script = $3
			sub(/^.*\//, "", executable)
			if (pid != self && executable == "node" && allowed[script]) print pid
		}
	'
	rm -f "$paths_file"
}

write_legacy_mode_receipt() {
	local pid="$1"
	local client="$2"
	local reason="${3:-fallback}"
	local retry_seconds="${4:-300}"
	local receipt="$(legacy_mode_receipt_path)"
	mkdir -p "$(dirname "$receipt")"
	node - "$receipt" "$pid" "$client" "$reason" "$retry_seconds" <<'NODE'
const fs = require("node:fs");
const [file, pid, client, reason, retrySeconds] = process.argv.slice(2);
const temporary = `${file}.tmp-${process.pid}`;
const startedAt = new Date();
fs.writeFileSync(temporary, `${JSON.stringify({
	schemaVersion: 1,
	mode: "legacy",
	pid: Number(pid),
	client,
	reason,
	startedAt: startedAt.toISOString(),
	modernRetryAt: new Date(
		startedAt.getTime() + Number(retrySeconds || 300) * 1000
	).toISOString()
}, null, 2)}\n`);
fs.renameSync(temporary, file);
NODE
}

clear_legacy_mode_receipt() {
	rm -f "$(legacy_mode_receipt_path)"
}
