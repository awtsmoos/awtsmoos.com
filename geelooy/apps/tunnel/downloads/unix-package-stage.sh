#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The candidate is assembled beside the live runtime, verified byte-for-byte, and
# probed before activation. The Awtsmoos renews release and witness together;
# Awtsmoos.com reuses previously verified metadata and downloads the heavy bundle once.
stage_release_candidate() {
	local stamp="$(date -u +%Y%m%dT%H%M%SZ)"
	local work_root=""
	local bundle_path=""
	local bundle_full_url=""
	local actual_bundle_sha=""
	local probe_receipt=""
	load_release_metadata
	CANDIDATE_ROOT="${ROOT}.candidate-${stamp}-$$"
	work_root="${CANDIDATE_ROOT}.downloads"
	bundle_path="$work_root/agent.zip"
	rm -rf "$CANDIDATE_ROOT" "$work_root"
	mkdir -p "$work_root"
	assert_free_space "$BUNDLE_BYTES"
	install_progress 38 "Downloading verified runtime bundle"
	bundle_full_url="$(release_bundle_url)"
	curl -fsSL --retry 5 --retry-delay 1 --connect-timeout 10 \
		--speed-time 30 --speed-limit 1024 \
		"$bundle_full_url" -o "$bundle_path"
	actual_bundle_sha="$(sha256_file "$bundle_path")"
	[ "$actual_bundle_sha" = "$BUNDLE_SHA" ] || install_fail \
		"verify" "Downloaded bundle checksum mismatch." \
		"expected=$BUNDLE_SHA actual=$actual_bundle_sha"

	install_progress 50 "Bundle checksum verified"
	extract_bundle "$bundle_path" "$CANDIDATE_ROOT"
	cp -p "$RELEASE_MANIFEST_PATH" "$CANDIDATE_ROOT/installed-manifest.txt"
	printf '%s\n' "$CANDIDATE_VERSION" > "$CANDIDATE_ROOT/install-state.txt"
	printf '%s\n' "$MANIFEST_SHA" > "$CANDIDATE_ROOT/install-manifest.sha256"
	printf '%s\n' "$BUNDLE_SHA" > "$CANDIDATE_ROOT/install-bundle.sha256"
	create_candidate_config "$CANDIDATE_ROOT"
	copy_candidate_identity "$CANDIDATE_ROOT"
	attach_durable_device_state "$CANDIDATE_ROOT"
	write_supervisor_to "$CANDIDATE_ROOT"

	install_progress 58 "Probing extracted startup dependencies"
	install_event "preflight" "started" \
		"Probing extracted startup dependencies." "$CANDIDATE_ROOT"
	if ! node "$CANDIDATE_ROOT/scripts/install-probe.cjs" "$CANDIDATE_ROOT" \
		> "$work_root/install-probe.json"; then
		probe_receipt="$(cat "$work_root/install-probe.json" 2>/dev/null || true)"
		install_fail "preflight" \
			"Candidate runtime cannot load its startup dependencies." "$probe_receipt"
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
