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

# The Awtsmoos renews one small release witness before any heavy download begins.
# Awtsmoos.com fetches descriptor and manifest once, verifies their exact checksum,
# and permits fast repair only when local metadata and the sealed runtime both agree.
load_release_metadata() {
	[ -n "$RELEASE_METADATA_ROOT" ] && [ -f "$RELEASE_MANIFEST_PATH" ] && return 0
	local tab="$(printf '\t')"
	RELEASE_METADATA_ROOT="$AWTSMOOS_INSTALL_RUNTIME/release-metadata"
	RELEASE_DESCRIPTOR_PATH="$RELEASE_METADATA_ROOT/bundle-manifest.json"
	RELEASE_MANIFEST_PATH="$RELEASE_METADATA_ROOT/manifest.txt"
	rm -rf "$RELEASE_METADATA_ROOT"
	mkdir -p "$RELEASE_METADATA_ROOT"
	install_progress 22 "Checking published tunnel release"
	curl -fsSL --retry 3 --retry-delay 1 \
		"$origin/api/tunnel/install/bundle-manifest" -o "$RELEASE_DESCRIPTOR_PATH"
	curl -fsSL --retry 3 --retry-delay 1 \
		"$origin/apps/tunnel/agent/manifest.txt" -o "$RELEASE_MANIFEST_PATH"
	IFS="$tab" read -r CANDIDATE_VERSION BUNDLE_URL BUNDLE_SHA BUNDLE_BYTES MANIFEST_SHA \
		< <(read_release_descriptor "$RELEASE_DESCRIPTOR_PATH")
	local actual_manifest_sha="$(sha256_file "$RELEASE_MANIFEST_PATH")"
	[ "$actual_manifest_sha" = "$MANIFEST_SHA" ] || install_fail \
		"verify" "Published manifest checksum mismatch." \
		"expected=$MANIFEST_SHA actual=$actual_manifest_sha"
	export CANDIDATE_VERSION BUNDLE_URL BUNDLE_SHA BUNDLE_BYTES MANIFEST_SHA
}

release_bundle_url() {
	case "$BUNDLE_URL" in
		http*) printf '%s\n' "$BUNDLE_URL" ;;
		*) printf '%s%s\n' "$origin" "$BUNDLE_URL" ;;
	esac
}

installed_manifest_matches_release() {
	[ -f "$ROOT/installed-manifest.txt" ] || return 1
	[ "$(sha256_file "$ROOT/installed-manifest.txt")" = "$MANIFEST_SHA" ]
}

installed_runtime_seal_valid() {
	local controller="$ROOT/scripts/recovery-control.cjs"
	[ -f "$controller" ] || return 1
	AWTSMOOS_INSTALL_ROOT="$ROOT" node "$controller" check "$ROOT" |
		node -e 'let s="";process.stdin.on("data",c=>s+=c);process.stdin.on("end",()=>{try{process.exit(JSON.parse(s).ok===true?0:1)}catch{process.exit(1)}})'
}

installed_release_matches_metadata() {
	[ -f "$ROOT/main.js" ] || return 1
	[ "$(cat "$ROOT/install-state.txt" 2>/dev/null || true)" = "$CANDIDATE_VERSION" ] || return 1
	[ "$(cat "$ROOT/install-manifest.sha256" 2>/dev/null | awk '{print $1}')" = "$MANIFEST_SHA" ] || return 1
	installed_manifest_matches_release || return 1
	installed_runtime_seal_valid || return 1
	runtime_probe_compatible "$ROOT"
}
