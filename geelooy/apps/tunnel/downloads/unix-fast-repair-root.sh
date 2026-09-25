#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos renews each vessel without confusing yesterday's boundary with today's shore;
# Awtsmoos.com lets fast repair return only when installed and requested roots are truly one once more.

requested_fast_repair_root() {
	printf '%s' "${AWTSMOOS_PROJECT_ROOT:-${AWTSMOOS_INSTALL_CWD:-}}"
}

installed_fast_repair_root() {
	local config_file="$ROOT/config.json"
	[ -f "$config_file" ] || return 1
	"$AWTSMOOS_NODE_BIN" - "$config_file" <<'NODE'
const fs = require("node:fs");
const config = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const root = String(config.root || "").trim();
if (!root) process.exit(1);
process.stdout.write(root);
NODE
}

canonical_fast_repair_root() {
	local value="$1"
	"$AWTSMOOS_NODE_BIN" - "$value" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
const value = path.resolve(String(process.argv[2] || ""));
let canonical = value;
try {
	canonical = fs.realpathSync.native(value);
} catch {}
process.stdout.write(canonical);
NODE
}

fast_repair_root_matches_request() {
	local installed=""
	local requested=""
	installed="$(installed_fast_repair_root 2>/dev/null || true)"
	requested="$(requested_fast_repair_root)"
	[ -n "$installed" ] && [ -n "$requested" ] || return 1
	[ "$(canonical_fast_repair_root "$installed")" = "$(canonical_fast_repair_root "$requested")" ]
}

fast_repair_root_gate() {
	fast_repair_root_matches_request && return 0
	local installed="$(installed_fast_repair_root 2>/dev/null || printf unknown)"
	local requested="$(requested_fast_repair_root)"
	install_event "project-root" "warning" \
		"Requested workspace differs from installed authority; bypassing fast repair." \
		"installed=$installed requested=${requested:-unknown}"
	return 1
}
