#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

RELEASE_METADATA_ROOT=""
RELEASE_DESCRIPTOR_PATH=""
RELEASE_MANIFEST_PATH=""
BUNDLE_URL=""
BUNDLE_SHA=""
BUNDLE_BYTES=""
RELEASE_SOURCE_SHA=""
RELEASE_METADATA_ERROR=""

# The Awtsmoos renews one small release witness before any heavy download begins;
# Awtsmoos.com verifies runtime artifact identity independently from Git provenance.
# B"H — fail fast with the exact SHAs named. A stale cached manifest is
# the Nov 6 failure (bundle-manifest 500, stuck at 22%); never fail
# silently and never let a mismatched manifest reach the bundle download.
# Returns 0 when the manifest at $2 hashes to $1, else 1.
assert_manifest_sha_matches() {
	local expected="$1" actual="$2" path="$3"
	if [ "$actual" = "$expected" ]; then
		return 0
	fi
	install_event "release-metadata" "failed" \
		"Published manifest checksum mismatch." \
		"expected=$expected actual=$actual path=$path"
	printf '[Awtsmoos][release-metadata][failed] Manifest checksum mismatch: expected=%s actual=%s path=%s\n' \
		"$expected" "$actual" "$path" >&2
	return 1
}

load_release_metadata() {
	if [ -n "$RELEASE_METADATA_ROOT" ] && 		[ -f "$RELEASE_DESCRIPTOR_PATH" ] && 		[ -f "$RELEASE_MANIFEST_PATH" ] && 		[ -n "$BUNDLE_SHA" ] && 		[ -n "$RELEASE_SOURCE_SHA" ]; then
		return 0
	fi
	local tab="$(printf '\t')"
	RELEASE_METADATA_ROOT="$AWTSMOOS_INSTALL_RUNTIME/release-metadata"
	RELEASE_DESCRIPTOR_PATH="$RELEASE_METADATA_ROOT/bundle-manifest.json"
	RELEASE_MANIFEST_PATH="$RELEASE_METADATA_ROOT/manifest.txt"
	rm -rf "$RELEASE_METADATA_ROOT"
	mkdir -p "$RELEASE_METADATA_ROOT"
	install_progress 22 "Checking published tunnel release"
	# B"H — the descriptor and manifest are independent immutable public
	# resources. Fetch them concurrently; hash and compare both before trusting
	# either. Wait for both children even when one fails, leaving no curl orphan.
	local descriptor_pid manifest_pid descriptor_status=0 manifest_status=0
	curl -fsSL --retry 1 --retry-delay 0 --connect-timeout 2 --max-time 6 --speed-time 3 --speed-limit 1024 \
		"$origin/api/tunnel/install/bundle-manifest" -o "$RELEASE_DESCRIPTOR_PATH" &
	descriptor_pid=$!
	curl -fsSL --retry 1 --retry-delay 0 --connect-timeout 2 --max-time 6 --speed-time 3 --speed-limit 1024 \
		"$origin/api/tunnel/install/manifest.txt" -o "$RELEASE_MANIFEST_PATH" &
	manifest_pid=$!
	wait "$descriptor_pid" || descriptor_status=$?
	if [ "$descriptor_status" -ne 0 ]; then
		# Never wait on a speculative download after the descriptor has failed.
		kill "$manifest_pid" 2>/dev/null || true
		wait "$manifest_pid" 2>/dev/null || true
		rm -rf "$RELEASE_METADATA_ROOT"
		return 1
	fi
	# B"H 2026-11-06: the server answers a broken bundle build with an
	# error JSON (BUNDLE_MANIFEST_BUILD_FAILED) — sometimes on wire HTTP
	# 200, so curl succeeds and the descriptor parse below fails with no
	# reason. Name the server's message immediately and fail fast instead
	# of leaving the fallback to burn silent minutes first.
	if grep -Fq 'BUNDLE_MANIFEST_BUILD_FAILED' "$RELEASE_DESCRIPTOR_PATH" 2>/dev/null; then
		RELEASE_METADATA_ERROR="$("$AWTSMOOS_NODE_BIN" - "$RELEASE_DESCRIPTOR_PATH" <<'NODE' 2>/dev/null || true
const fs = require("node:fs");
try {
	const body = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
	process.stdout.write(String(body?.error?.message || body?.error?.code || ""));
} catch {}
NODE
)"
		[ -n "$RELEASE_METADATA_ERROR" ] || RELEASE_METADATA_ERROR="BUNDLE_MANIFEST_BUILD_FAILED"
		export RELEASE_METADATA_ERROR
		install_event "release-metadata" "failed" \
			"Published release metadata is unavailable: $RELEASE_METADATA_ERROR." \
			"origin=$origin"
		kill "$manifest_pid" 2>/dev/null || true
		wait "$manifest_pid" 2>/dev/null || true
		rm -rf "$RELEASE_METADATA_ROOT"
		return 1
	fi
	if ! IFS="$tab" read -r CANDIDATE_VERSION BUNDLE_URL BUNDLE_SHA BUNDLE_BYTES \
		MANIFEST_SHA RELEASE_SOURCE_SHA < <(read_release_descriptor "$RELEASE_DESCRIPTOR_PATH"); then
		# Never wait on a speculative download after the descriptor has failed.
		kill "$manifest_pid" 2>/dev/null || true
		wait "$manifest_pid" 2>/dev/null || true
		rm -rf "$RELEASE_METADATA_ROOT"
		return 1
	fi
	# B"H — only an exact already-installed bundle may supply the same
	# cryptographically hashed manifest. It is verified against the LIVE HTTPS
	# descriptor first; new releases still download and verify the public file.
	local reuse_installed_manifest=0
	if [ -n "${ROOT:-}" ] && [ -f "$ROOT/installed-manifest.txt" ] && \
		[ -f "$ROOT/install-state.txt" ] && [ -f "$ROOT/install-bundle.sha256" ] && \
		[ "$(cat "$ROOT/install-state.txt")" = "$CANDIDATE_VERSION" ] && \
		[ "$(awk 'NR == 1 { print $1 }' "$ROOT/install-bundle.sha256")" = "$BUNDLE_SHA" ] && \
		[ "$(sha256_file "$ROOT/installed-manifest.txt")" = "$MANIFEST_SHA" ]; then
		reuse_installed_manifest=1
	fi
	if [ "$reuse_installed_manifest" -eq 1 ]; then
		# The manifest fetch was speculative; terminate only our own child
		# and wait for it before replacing its output. Never leave a writer.
		kill "$manifest_pid" 2>/dev/null || true
		wait "$manifest_pid" 2>/dev/null || true
		cp -p "$ROOT/installed-manifest.txt" "$RELEASE_MANIFEST_PATH" || return 1
	else
		wait "$manifest_pid" || manifest_status=$?
		if [ "$manifest_status" -ne 0 ]; then
			rm -rf "$RELEASE_METADATA_ROOT"
			return 1
		fi
	fi
	local actual_manifest_sha="$(sha256_file "$RELEASE_MANIFEST_PATH")"
	if ! assert_manifest_sha_matches "$MANIFEST_SHA" "$actual_manifest_sha" "$RELEASE_MANIFEST_PATH"; then
		rm -rf "$RELEASE_METADATA_ROOT"
		return 1
	fi
	export CANDIDATE_VERSION BUNDLE_URL BUNDLE_SHA BUNDLE_BYTES MANIFEST_SHA RELEASE_SOURCE_SHA
}

release_bundle_url() {
	case "$BUNDLE_URL" in
		http*)
			printf '%s\n' "$BUNDLE_URL"
			;;
		*)
			printf '%s%s\n' "$origin" "$BUNDLE_URL"
			;;
	esac
}

installed_manifest_matches_release() {
	[ -f "$ROOT/installed-manifest.txt" ] || return 1
	[ "$(sha256_file "$ROOT/installed-manifest.txt")" = "$MANIFEST_SHA" ]
}

installed_runtime_seal_valid() {
	local controller="$ROOT/scripts/recovery-control.cjs"
	[ -f "$controller" ] || return 1
	AWTSMOOS_INSTALL_ROOT="$ROOT" 		"$AWTSMOOS_NODE_BIN" "$controller" check "$ROOT" | 		"$AWTSMOOS_NODE_BIN" -e 'let s="";process.stdin.on("data",c=>s+=c);process.stdin.on("end",()=>{try{process.exit(JSON.parse(s).ok===true?0:1)}catch{process.exit(1)}})'
}

installed_runtime_self_verified() {
	[ -f "$ROOT/main.js" ] || return 1
	[ -f "$ROOT/installed-manifest.txt" ] || return 1
	local installed_version="$(cat "$ROOT/install-state.txt" 2>/dev/null || true)"
	local declared_manifest_sha="$(awk 'NR == 1 { print $1 }' "$ROOT/install-manifest.sha256" 2>/dev/null || true)"
	local declared_bundle_sha="$(awk 'NR == 1 { print $1 }' "$ROOT/install-bundle.sha256" 2>/dev/null || true)"
	[ -n "$installed_version" ] || return 1
	[ -n "$declared_manifest_sha" ] || return 1
	[ -n "$declared_bundle_sha" ] || return 1
	[ "$(sha256_file "$ROOT/installed-manifest.txt")" = "$declared_manifest_sha" ] || return 1
	installed_runtime_seal_valid || return 1
	runtime_probe_compatible "$ROOT"
}

installed_release_matches_metadata() {
	[ -f "$ROOT/main.js" ] || return 1
	[ "$(cat "$ROOT/install-state.txt" 2>/dev/null || true)" = "$CANDIDATE_VERSION" ] || return 1
	[ "$(cat "$ROOT/install-manifest.sha256" 2>/dev/null | awk '{print $1}')" = "$MANIFEST_SHA" ] || return 1
	[ "$(cat "$ROOT/install-bundle.sha256" 2>/dev/null | awk '{print $1}')" = "$BUNDLE_SHA" ] || return 1
	installed_manifest_matches_release || return 1
	installed_runtime_seal_valid || return 1
	runtime_probe_compatible "$ROOT"
}
