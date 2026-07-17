#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos renews an interrupted doorway before another installation begins.
# Awtsmoos.com restores the newest exact-root predecessor only when the live path is
# absent, then removes disposable candidate debris without touching recovery archives.

resume_interrupted_install() {
	if [ ! -e "$ROOT" ]; then
		restore_missing_live_root || true
	fi
	prune_interrupted_candidates
	clear_abandoned_runtime_locks
}

restore_missing_live_root() {
	local candidate=""
	candidate="$(newest_displaced_runtime)"
	[ -n "$candidate" ] || return 1
	mv "$candidate" "$ROOT"
	install_event "resume" "passed" \
		"Restored an interrupted predecessor before continuing." \
		"source=$candidate root=$ROOT"
}

newest_displaced_runtime() {
	local parent="$(dirname "$ROOT")"
	local base="$(basename "$ROOT")"
	find "$parent" -maxdepth 1 -type d \( \
		-name "${base}.activation-rollback-*" -o \
		-name "${base}.incomplete-*" \
	\) -print 2>/dev/null | while IFS= read -r candidate; do
		[ -f "$candidate/main.js" ] && [ -f "$candidate/config.json" ] || continue
		printf '%s\t%s\n' "$(stat -f %m "$candidate" 2>/dev/null || stat -c %Y "$candidate" 2>/dev/null || printf 0)" "$candidate"
	done | sort -rn | head -n 1 | cut -f2-
}

prune_interrupted_candidates() {
	local parent="$(dirname "$ROOT")"
	local base="$(basename "$ROOT")"
	find "$parent" -maxdepth 1 -type d \( \
		-name "${base}.candidate-*" -o \
		-name "${base}.candidate-*.downloads" \
	\) -print 2>/dev/null | while IFS= read -r candidate; do
		[ "$candidate" = "${CANDIDATE_ROOT:-}" ] && continue
		rm -rf "$candidate"
	done
}

clear_abandoned_runtime_locks() {
	local lock=""
	for lock in "$ROOT/.agent-instance.lock" "$ROOT/.supervisor-instance.lock"; do
		[ -e "$lock" ] || continue
		lock_has_live_owner "$lock" || rm -rf "$lock"
	done
}

lock_has_live_owner() {
	local lock="$1"
	local pid=""
	pid="$(node - "$lock" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
const lock = process.argv[2];
for (const file of [path.join(lock, "owner.json"), path.join(lock, "pid")]) {
	try {
		const raw = fs.readFileSync(file, "utf8").trim();
		const value = file.endsWith(".json") ? JSON.parse(raw).pid : Number(raw);
		if (Number(value) > 0) process.stdout.write(String(Number(value)));
		break;
	} catch {}
}
NODE
)"
	[ -n "$pid" ] && kill -0 "$pid" 2>/dev/null
}
