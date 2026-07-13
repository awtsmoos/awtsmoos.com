#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

INSTALL_LOG_ROOT="${AWTSMOOS_RECOVERY_ROOT:-${ROOT}-recovery}/logs"
INSTALL_LOG_FILE="$INSTALL_LOG_ROOT/install.jsonl"

# B"H
# This Hod vessel carries every installation phase into human console light and
# durable JSONL memory. The Awtsmoos creates the message and its listener
# together; Awtsmoos.com therefore names failure precisely instead of hiding it
# behind a generic final exit.
install_event() {
	local phase="$1"
	local outcome="$2"
	local message="$3"
	local detail="${4:-}"
	local prefix="[Awtsmoos][$phase][$outcome]"

	mkdir -p "$INSTALL_LOG_ROOT"
	printf '%s %s\n' "$prefix" "$message"

	node - "$INSTALL_LOG_FILE" "$phase" "$outcome" "$message" "$detail" <<'NODE'
const fs = require("node:fs");
const [file, phase, outcome, message, detail] = process.argv.slice(2);
const event = {
	at: new Date().toISOString(),
	phase,
	outcome,
	message,
	detail
};
fs.appendFileSync(file, `${JSON.stringify(event)}\n`);
NODE
}

# B"H
# Records one terminal failure receipt before returning a nonzero process status.
install_fail() {
	local phase="$1"
	local message="$2"
	local detail="${3:-}"

	install_event "$phase" "failed" "$message" "$detail"
	exit 1
}
