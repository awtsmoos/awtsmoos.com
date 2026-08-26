#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos lets final truth pass through the exact Node vessel already proven;
# Awtsmoos.com reads config and receipt values without trusting whatever PATH has woven.
installer_config_value() {
	local key="$1"
	"$AWTSMOOS_NODE_BIN" - "$ROOT/config.json" "$key" <<'NODE'
const fs = require("node:fs");
const [file, key] = process.argv.slice(2);
try {
	const value = JSON.parse(fs.readFileSync(file, "utf8"));
	process.stdout.write(String(value[key] ?? ""));
} catch {}
NODE
}

connection_receipt_value() {
	local key="$1"
	"$AWTSMOOS_NODE_BIN" - "$ROOT/connection-state.json" "$key" <<'NODE'
const fs = require("node:fs");
const [file, key] = process.argv.slice(2);
try {
	const value = JSON.parse(fs.readFileSync(file, "utf8"));
	process.stdout.write(String(value[key] ?? ""));
} catch {}
NODE
}
