#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The candidate is assembled beside the live runtime, verified byte-for-byte, and
# probed before activation. The Awtsmoos renews release and witness together;
# Awtsmoos.com seals version, artifact hashes, and canonical source SHA before launch.
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
	# B"H 2026-11-08 hardening (speed): a verified bundle is cached by SHA
	# in the recovery root and reused instead of re-downloading. A reinstall
	# of the same release is then seconds, not a fresh download. The cache
	# is only trusted when its SHA matches the published descriptor exactly.
	local bundle_cache="${RECOVERY_ROOT}/cache/agent-bundle-${BUNDLE_SHA}.zip"
	local bundle_cached=0
	if [ -n "$BUNDLE_SHA" ] && [ -f "$bundle_cache" ] && \
		[ "$(sha256_file "$bundle_cache")" = "$BUNDLE_SHA" ]; then
		install_progress 38 "Using cached verified runtime bundle"
		cp -p "$bundle_cache" "$bundle_path"
		bundle_cached=1
	else
		install_progress 38 "Downloading verified runtime bundle"
		bundle_full_url="$(release_bundle_url)"
		curl -fsSL --retry 5 --retry-delay 1 --connect-timeout 10 --max-time 600 \
			--speed-time 30 --speed-limit 1024 "$bundle_full_url" -o "$bundle_path"
	fi
	actual_bundle_sha="$(sha256_file "$bundle_path")"
	[ "$actual_bundle_sha" = "$BUNDLE_SHA" ] || install_fail 		"verify" "Downloaded bundle checksum mismatch." 		"expected=$BUNDLE_SHA actual=$actual_bundle_sha"
	if [ "$bundle_cached" -eq 0 ]; then
		mkdir -p "$(dirname "$bundle_cache")"
		cp -p "$bundle_path" "${bundle_cache}.tmp-$$" 2>/dev/null && mv -f "${bundle_cache}.tmp-$$" "$bundle_cache" 2>/dev/null || true
	fi
	install_progress 50 "Bundle checksum verified"
	extract_bundle "$bundle_path" "$CANDIDATE_ROOT"
	# B"H 2026-11-08 hardening: a merge once stripped the executable bit
	# (100755 -> 100644) on 12 installer/deploy .sh files. Never trust the
	# bit as packaged — restore +x on every shell script in the candidate
	# before anything executes one directly (launchd, supervisor, awt).
	# This repairs a stripped bit instead of failing on it.
	find "$CANDIDATE_ROOT" -name '*.sh' -type f -exec chmod +x {} + 2>/dev/null || true
	cp -p "$RELEASE_MANIFEST_PATH" "$CANDIDATE_ROOT/installed-manifest.txt"
	printf '%s\n' "$CANDIDATE_VERSION" > "$CANDIDATE_ROOT/install-state.txt"
	printf '%s\n' "$MANIFEST_SHA" > "$CANDIDATE_ROOT/install-manifest.sha256"
	printf '%s\n' "$BUNDLE_SHA" > "$CANDIDATE_ROOT/install-bundle.sha256"
	printf '%s\n' "$RELEASE_SOURCE_SHA" > "$CANDIDATE_ROOT/release-source-sha.txt"
	create_candidate_config "$CANDIDATE_ROOT"
	copy_candidate_identity "$CANDIDATE_ROOT"
	attach_durable_device_state "$CANDIDATE_ROOT"
	write_supervisor_to "$CANDIDATE_ROOT"
	if [ -f "$CANDIDATE_ROOT/awt" ]; then
		chmod +x "$CANDIDATE_ROOT/awt"
	fi
	install_progress 58 "Probing extracted startup dependencies"
	install_event "preflight" "started" 		"Probing extracted startup dependencies." "$CANDIDATE_ROOT"
	if ! node "$CANDIDATE_ROOT/scripts/install-probe.cjs" "$CANDIDATE_ROOT" 		> "$work_root/install-probe.json"; then
		probe_receipt="$(cat "$work_root/install-probe.json" 2>/dev/null || true)"
		install_fail "preflight" 			"Candidate runtime cannot load its startup dependencies." "$probe_receipt"
	fi
	node "$CANDIDATE_ROOT/scripts/recovery-control.cjs" seal "$CANDIDATE_ROOT" 		> "$work_root/recovery-seal.json"
	rm -rf "$work_root"
	install_progress 65 "Release staged and bootable"
	install_event "preflight" "passed" 		"Candidate is complete and bootable." 		"version=$CANDIDATE_VERSION sourceSha=$RELEASE_SOURCE_SHA root=$CANDIDATE_ROOT"
	export CANDIDATE_ROOT CANDIDATE_VERSION RELEASE_SOURCE_SHA
}
