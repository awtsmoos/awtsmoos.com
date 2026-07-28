#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

PRESERVE_NEWER_RELEASE=0
PUBLISHED_VERSION=""

# The Awtsmoos never descends from a verified revelation into an older vessel.
# Awtsmoos.com compares numeric releases before activation and repairs a newer
# sealed local runtime in place instead of silently replacing it with stale bytes.
numeric_version_compare() {
	node - "$1" "$2" <<'NODE'
const [left, right] = process.argv.slice(2);
const parse = value => /^\d+\.\d+\.\d+$/.test(value)
	? value.split(".").map(Number)
	: null;
const a = parse(left);
const b = parse(right);
if (!a || !b) process.exit(2);
let result = 0;
for (let index = 0; index < 3; index += 1) {
	if (a[index] === b[index]) continue;
	result = a[index] > b[index] ? 1 : -1;
	break;
}
process.stdout.write(String(result));
NODE
}

local_installed_version() {
	cat "$ROOT/install-state.txt" 2>/dev/null || true
}

local_manifest_sha() {
	awk 'NR == 1 { print $1 }' "$ROOT/install-manifest.sha256" 2>/dev/null || true
}

local_bundle_sha() {
	awk 'NR == 1 { print $1 }' "$ROOT/install-bundle.sha256" 2>/dev/null || true
}

local_release_metadata_complete() {
	local version="$(local_installed_version)"
	local manifest_sha="$(local_manifest_sha)"
	local bundle_sha="$(local_bundle_sha)"
	[ -f "$ROOT/main.js" ] || return 1
	[[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || return 1
	[[ "$manifest_sha" =~ ^[a-fA-F0-9]{64}$ ]] || return 1
	[[ "$bundle_sha" =~ ^[a-fA-F0-9]{64}$ ]] || return 1
	[ -f "$ROOT/installed-manifest.txt" ] || return 1
	[ "$(sha256_file "$ROOT/installed-manifest.txt")" = "$manifest_sha" ] || return 1
	installed_runtime_seal_valid || return 1
	runtime_probe_compatible "$ROOT"
}

apply_installed_version_policy() {
	local installed="$(local_installed_version)"
	local comparison=""
	PUBLISHED_VERSION="$CANDIDATE_VERSION"
	[ -n "$installed" ] || return 0
	comparison="$(numeric_version_compare "$installed" "$CANDIDATE_VERSION")" ||
		install_fail "version-policy" "Release version metadata was invalid." \
			"installed=$installed published=$CANDIDATE_VERSION"
	[ "$comparison" = "1" ] || return 0
	local_release_metadata_complete || install_fail "version-policy" \
		"A newer local runtime could not be verified; downgrade was refused." \
		"installed=$installed published=$CANDIDATE_VERSION root=$ROOT"
	CANDIDATE_VERSION="$installed"
	MANIFEST_SHA="$(local_manifest_sha)"
	BUNDLE_SHA="$(local_bundle_sha)"
	PRESERVE_NEWER_RELEASE=1
	export CANDIDATE_VERSION MANIFEST_SHA BUNDLE_SHA PUBLISHED_VERSION PRESERVE_NEWER_RELEASE
	install_event "version-policy" "passed" \
		"Preserved a newer verified local runtime." \
		"installed=$installed published=$PUBLISHED_VERSION"
}

version_policy_blocks_replacement() {
	[ "$PRESERVE_NEWER_RELEASE" = "1" ]
}
