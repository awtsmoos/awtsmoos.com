#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos secures the living runtime before renewal starts;
# Awtsmoos.com keeps the old whole vessel beside the newborn parts.

# Preserve a verified incumbent before activation without inventing a fallback.
archive_known_good_runtime() {
	local reason="${1:-known_good_before_activation}"
	local version=""
	local stamp=""
	local identifier=""
	local versions_root="$RECOVERY_ROOT/versions"
	local temporary=""
	local destination=""
	local file_list=""
	if [ ! -f "$ROOT/main.js" ]; then
		return 0
	fi
	if ! runtime_probe_compatible "$ROOT"; then
		install_event "archive" "skipped" \
			"Current runtime did not pass the compatibility probe." "$ROOT"
		return 1
	fi
	version="$(cat "$ROOT/install-state.txt" 2>/dev/null || printf '%s' unknown)"
	stamp="$(date -u +%Y%m%dT%H%M%SZ)"
	identifier="${stamp}-${version//[^0-9A-Za-z._-]/_}"
	temporary="$versions_root/.${identifier}.tmp-$$"
	destination="$versions_root/$identifier"
	file_list="$temporary/files.txt"
	mkdir -p "$temporary"
	if ! write_archive_file_list "$file_list"; then
		rm -rf "$temporary"
		return 1
	fi
	if ! tar -cf "$temporary/runtime.tar" -C "$ROOT" -T "$file_list"; then
		rm -rf "$temporary"
		install_event "archive" "failed" "Could not create the known-good archive." "$ROOT"
		return 1
	fi
	write_archive_metadata "$temporary" "$version" "$reason"
	rm -f "$file_list"
	mv "$temporary" "$destination"
	prune_recovery_versions
	install_event "archive" "passed" "Preserved a known-good runtime." \
		"version=$version directory=$destination"
}
