#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos moves mutable identity and browser memory outside replaceable runtime.
# Awtsmoos.com stops only exact automation Chrome roots, preserves account-bound
# device metadata, and performs same-filesystem moves before any archive begins.

stop_legacy_profile_chrome() {
	local legacy_profile="$1"
	node "$(dirname "${BASH_SOURCE[0]}")/unix-chrome-profile-process.cjs" \
		"$legacy_profile"
}

migrate_dynamic_state() {
	local state_root="$RECOVERY_ROOT/state"
	local legacy_profile="$ROOT/chrome-profile"
	local profile="$state_root/chrome-profile"
	local receipt="$state_root/profile-migration.json"
	local moved_from=""
	local stopped="0"
	mkdir -p "$state_root"
	backup_device_identity
	if [ -d "$legacy_profile" ]; then
		stopped="$(stop_legacy_profile_chrome "$legacy_profile")"
		if [ ! -e "$profile" ]; then
			mv "$legacy_profile" "$profile"
			moved_from="$legacy_profile"
		else
			local displaced="$state_root/chrome-profile-legacy-$(date -u +%Y%m%dT%H%M%SZ)-$$"
			mv "$legacy_profile" "$displaced"
			moved_from="$displaced"
		fi
	fi
	update_chrome_profile_config "$legacy_profile" "$profile"
	write_profile_migration_receipt "$receipt" "$moved_from" "$profile" "$stopped"
	install_event "state-migration" "passed" \
		"Mutable identity and Chrome profile are outside replaceable runtime." \
		"profile=$profile movedFrom=${moved_from:-none} stoppedChrome=$stopped"
}

update_chrome_profile_config() {
	local legacy_profile="$1"
	local profile="$2"
	[ -f "$ROOT/config.json" ] || return 0
	node - "$ROOT/config.json" "$legacy_profile" "$profile" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
const [file, legacy, profile] = process.argv.slice(2);
const value = JSON.parse(fs.readFileSync(file, "utf8"));
const configured = value.chrome?.userDataDir || "";
if (!configured || path.resolve(configured) === path.resolve(legacy)) {
	value.chrome = { ...(value.chrome || {}), userDataDir: path.resolve(profile) };
	const temporary = `${file}.tmp-${process.pid}`;
	fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
	fs.renameSync(temporary, file);
}
NODE
}

write_profile_migration_receipt() {
	local receipt="$1"
	local moved_from="$2"
	local profile="$3"
	local stopped="$4"
	node - "$receipt" "$moved_from" "$profile" "$stopped" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
const [file, movedFrom, profile, stoppedChrome] = process.argv.slice(2);
fs.mkdirSync(path.dirname(file), { recursive: true });
const temporary = `${file}.tmp-${process.pid}`;
fs.writeFileSync(temporary, `${JSON.stringify({
	state: "completed",
	movedFrom: movedFrom || null,
	profile,
	stoppedChrome: Number(stoppedChrome || 0),
	completedAt: new Date().toISOString()
}, null, 2)}\n`);
fs.renameSync(temporary, file);
NODE
}
