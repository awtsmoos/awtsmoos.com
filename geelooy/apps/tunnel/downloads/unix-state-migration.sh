#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos moves mutable identity, job receipts, and browser memory outside replaceable runtime.
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
	mkdir -p "$state_root/device-state"
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
		"Mutable identity, durable jobs, and Chrome profile are outside replaceable runtime." \
		"profile=$profile deviceState=$state_root/device-state movedFrom=${moved_from:-none} stoppedChrome=$stopped"
}

# Candidates always point at the account's durable state before they can become live.
# The link contains no release bytes and is intentionally outside the signed inventory.
attach_durable_device_state() {
	local runtime_root="$1"
	local durable="$RECOVERY_ROOT/state/device-state"
	local runtime_state="$runtime_root/device-state"
	mkdir -p "$durable"
	if [ -L "$runtime_state" ]; then
		rm -f "$runtime_state"
	elif [ -e "$runtime_state" ]; then
		install_fail "state-migration" \
			"Candidate unexpectedly contained mutable device state." \
			"runtime=$runtime_root state=$runtime_state"
	fi
	ln -s "$durable" "$runtime_state"
}

# This runs only after the incumbent process tree has stopped. It atomically
# preserves receipts that older releases kept beneath the replaceable runtime,
# then leaves the displaced runtime rollback-safe through the same durable link.
migrate_runtime_device_state() {
	local runtime_root="$1"
	local runtime_state="$runtime_root/device-state"
	local durable="$RECOVERY_ROOT/state/device-state"
	local receipt="$RECOVERY_ROOT/state/device-state-migration.json"
	mkdir -p "$durable"
	if [ -L "$runtime_state" ]; then
		rm -f "$runtime_state"
	elif [ -d "$runtime_state" ]; then
		merge_device_state_directories "$runtime_state" "$durable"
		rm -rf "$runtime_state"
	elif [ -e "$runtime_state" ]; then
		install_fail "state-migration" \
			"Legacy device state is not a directory." "$runtime_state"
	fi
	ln -s "$durable" "$runtime_state"
	write_device_state_migration_receipt "$receipt" "$runtime_root" "$durable"
}

merge_device_state_directories() {
	local source="$1"
	local destination="$2"
	node - "$source" "$destination" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
const [source, destination] = process.argv.slice(2);
const conflictRoot = path.join(
	path.dirname(destination),
	"device-state-migration-conflicts",
	new Date().toISOString().replace(/[^0-9A-Za-z]+/g, "-"),
);

function stat(file) {
	try { return fs.lstatSync(file); } catch { return null; }
}

function preserveConflict(file, relative) {
	const target = path.join(conflictRoot, relative);
	fs.mkdirSync(path.dirname(target), { recursive: true });
	fs.renameSync(file, target);
}

function merge(from, to, relative = "") {
	const fromStat = stat(from);
	if (!fromStat) return;
	const toStat = stat(to);
	if (!toStat) {
		fs.mkdirSync(path.dirname(to), { recursive: true });
		fs.renameSync(from, to);
		return;
	}
	if (fromStat.isDirectory() && toStat.isDirectory()) {
		for (const name of fs.readdirSync(from)) {
			merge(path.join(from, name), path.join(to, name), path.join(relative, name));
		}
		return;
	}
	if (fromStat.mtimeMs >= toStat.mtimeMs) {
		preserveConflict(to, path.join("destination", relative || "root"));
		fs.renameSync(from, to);
		return;
	}
	preserveConflict(from, path.join("source", relative || "root"));
}

fs.mkdirSync(destination, { recursive: true });
for (const name of fs.readdirSync(source)) {
	merge(path.join(source, name), path.join(destination, name), name);
}
NODE
}

write_device_state_migration_receipt() {
	local receipt="$1"
	local runtime_root="$2"
	local durable="$3"
	node - "$receipt" "$runtime_root" "$durable" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
const [file, runtimeRoot, deviceState] = process.argv.slice(2);
fs.mkdirSync(path.dirname(file), { recursive: true });
const temporary = `${file}.tmp-${process.pid}`;
fs.writeFileSync(temporary, `${JSON.stringify({
	state: "completed",
	runtimeRoot,
	deviceState,
	completedAt: new Date().toISOString()
}, null, 2)}\n`);
fs.renameSync(temporary, file);
NODE
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
