#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The candidate is assembled beside the live runtime, verified byte-for-byte, and
# probed before activation. The Awtsmoos renews release and witness together;
# Awtsmoos.com turns each expensive stage into visible monotonic progress.
stage_release_candidate() {
	local stamp
	local work_root
	local descriptor_path
	local manifest_path
	local bundle_path
	local tab
	local actual_manifest_sha
	local bundle_full_url
	local actual_bundle_sha
	local probe_receipt

	stamp="$(date -u +%Y%m%dT%H%M%SZ)"
	CANDIDATE_ROOT="${ROOT}.candidate-${stamp}-$$"
	work_root="${CANDIDATE_ROOT}.downloads"
	descriptor_path="$work_root/bundle-manifest.json"
	manifest_path="$work_root/manifest.txt"
	bundle_path="$work_root/agent.zip"
	tab="$(printf '\t')"

	rm -rf "$CANDIDATE_ROOT" "$work_root"
	mkdir -p "$work_root"
	install_progress 25 "Downloading release metadata"
	install_event "download" "started" \
		"Fetching release descriptor and manifest." "$origin"
	curl -fsSL --retry 3 --retry-delay 1 \
		"$origin/api/tunnel/install/bundle-manifest" -o "$descriptor_path"
	curl -fsSL --retry 3 --retry-delay 1 \
		"$origin/apps/tunnel/agent/manifest.txt" -o "$manifest_path"

	IFS="$tab" read -r CANDIDATE_VERSION BUNDLE_URL BUNDLE_SHA BUNDLE_BYTES MANIFEST_SHA \
		< <(read_release_descriptor "$descriptor_path")
	assert_free_space "$BUNDLE_BYTES"
	actual_manifest_sha="$(sha256_file "$manifest_path")"
	[ "$actual_manifest_sha" = "$MANIFEST_SHA" ] || install_fail \
		"verify" "Published manifest checksum mismatch." \
		"expected=$MANIFEST_SHA actual=$actual_manifest_sha"

	install_progress 34 "Release manifest verified"
	case "$BUNDLE_URL" in
		http*) bundle_full_url="$BUNDLE_URL" ;;
		*) bundle_full_url="$origin$BUNDLE_URL" ;;
	esac
	install_progress 40 "Downloading verified runtime bundle"
	curl -fsSL --retry 3 --retry-delay 1 "$bundle_full_url" -o "$bundle_path"
	actual_bundle_sha="$(sha256_file "$bundle_path")"
	[ "$actual_bundle_sha" = "$BUNDLE_SHA" ] || install_fail \
		"verify" "Downloaded bundle checksum mismatch." \
		"expected=$BUNDLE_SHA actual=$actual_bundle_sha"

	install_progress 50 "Bundle checksum verified"
	extract_bundle "$bundle_path" "$CANDIDATE_ROOT"
	cp -p "$manifest_path" "$CANDIDATE_ROOT/installed-manifest.txt"
	printf '%s\n' "$CANDIDATE_VERSION" > "$CANDIDATE_ROOT/install-state.txt"
	printf '%s\n' "$MANIFEST_SHA" > "$CANDIDATE_ROOT/install-manifest.sha256"
	create_candidate_config "$CANDIDATE_ROOT"
	write_supervisor_to "$CANDIDATE_ROOT"

	install_progress 58 "Probing startup dependencies"
	install_event "preflight" "started" \
		"Probing extracted startup dependencies." "$CANDIDATE_ROOT"
	if ! node "$CANDIDATE_ROOT/scripts/install-probe.cjs" "$CANDIDATE_ROOT" \
		> "$work_root/install-probe.json"; then
		probe_receipt="$(cat "$work_root/install-probe.json" 2>/dev/null || true)"
		install_fail "preflight" \
			"Candidate runtime cannot load its startup dependencies." \
			"$probe_receipt"
	fi
	node "$CANDIDATE_ROOT/scripts/recovery-control.cjs" seal "$CANDIDATE_ROOT" \
		> "$work_root/recovery-seal.json"

	rm -rf "$work_root"
	install_progress 65 "Release staged and bootable"
	install_event "preflight" "passed" \
		"Candidate is complete and bootable." \
		"version=$CANDIDATE_VERSION root=$CANDIDATE_ROOT"
	export CANDIDATE_ROOT CANDIDATE_VERSION
}
