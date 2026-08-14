#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos preserves one checksum-bound installer archive between repairs.
# Awtsmoos.com re-hashes cached bytes before use and falls back to parallel helpers.
component_archive_cache() {
	local expected="${AWTSMOOS_INSTALLER_COMPONENTS_SHA256:-}"
	local recovery="${AWTSMOOS_RECOVERY_ROOT:-${install_root}-recovery}"
	printf '%s/cache/installer-components-%s.tar.gz\n' "$recovery" "$expected"
}

file_sha256() {
	"$AWTSMOOS_NODE_BIN" -e '
const fs=require("node:fs"),crypto=require("node:crypto");
process.stdout.write(crypto.createHash("sha256").update(fs.readFileSync(process.argv[1])).digest("hex"));
' "$1"
}

extract_component_archive() {
	local archive="$1"
	local helper=""
	tar -xzf "$archive" -C "$runtime_root" || return 1
	for helper in "${helpers[@]}"; do
		[ -f "$runtime_root/$helper" ] || return 1
		chmod +x "$runtime_root/$helper"
	done
}

cache_component_archive() {
	local archive="$1"
	local cache="$2"
	local temporary="${cache}.${$}.tmp"
	mkdir -p "$(dirname "$cache")"
	cp -p "$archive" "$temporary"
	mv -f "$temporary" "$cache"
}

archive_components() {
	local expected="${AWTSMOOS_INSTALLER_COMPONENTS_SHA256:-}"
	local archive="$runtime_root/installer-components.tar.gz"
	local cache=""
	[[ "$expected" =~ ^[0-9a-f]{64}$ ]] || return 1
	cache="$(component_archive_cache)"
	if [ -f "$cache" ] && [ "$(file_sha256 "$cache")" = "$expected" ]; then
		bootstrap_progress 7 'Using cached verified installer components'
		cp -p "$cache" "$archive"
	else
		bootstrap_progress 7 'Downloading verified installer component bundle'
		curl -fsSL --retry 5 --retry-delay 1 --connect-timeout 10 \
			--speed-time 30 --speed-limit 1024 \
			"${AWTSMOOS_INSTALL_COMPONENTS_URL:-$origin/api/tunnel/install/installer-components.tar.gz}" \
			-o "$archive" || return 1
		[ "$(file_sha256 "$archive")" = "$expected" ] || return 1
		cache_component_archive "$archive" "$cache"
	fi
	[ "$(file_sha256 "$archive")" = "$expected" ] || return 1
	extract_component_archive "$archive" || return 1
	bootstrap_progress 18 \
		"Verified reinstall components ready (${#helpers[@]} files, one archive)"
}

wait_for_component_batch() {
	local failed=0
	local position=0
	local pid=""
	for pid in "${batch_pids[@]}"; do
		if ! wait "$pid"; then
			printf '[Awtsmoos][download][failed] Could not fetch %s.\n' \
				"${batch_helpers[$position]}" >&2
			failed=1
		fi
		position=$((position + 1))
	done
	batch_pids=()
	batch_helpers=()
	[ "$failed" -eq 0 ]
}

fallback_components() {
	local total="${#helpers[@]}"
	local index=0
	local helper=""
	local parallel="${AWTSMOOS_INSTALL_PARALLEL_DOWNLOADS:-16}"
	local percent=0
	case "$parallel" in ''|*[!0-9]*) parallel=16 ;; esac
	[ "$parallel" -ge 1 ] 2>/dev/null || parallel=1
	[ "$parallel" -le 16 ] 2>/dev/null || parallel=16
	batch_pids=()
	batch_helpers=()
	bootstrap_progress 7 'Using compatible component download fallback'
	for helper in "${helpers[@]}"; do
		index=$((index + 1))
		download_component "$helper" &
		batch_pids+=("$!")
		batch_helpers+=("$helper")
		if [ "${#batch_pids[@]}" -ge "$parallel" ] || [ "$index" -eq "$total" ]; then
			wait_for_component_batch
			percent=$((7 + index * 11 / total))
			bootstrap_progress "$percent" "Downloaded reinstall components ($index/$total)"
		fi
	done
}

download_component() {
	local helper="$1"
	local temporary="$runtime_root/.$helper.part"
	curl -fsSL --retry 5 --retry-delay 1 --connect-timeout 10 \
		--speed-time 30 --speed-limit 1024 "$origin/apps/tunnel/downloads/$helper" \
		-o "$temporary"
	chmod +x "$temporary"
	mv -f "$temporary" "$runtime_root/$helper"
}
