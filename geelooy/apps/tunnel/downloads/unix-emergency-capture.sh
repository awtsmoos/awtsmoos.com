#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# A successful verified runtime refreshes one sealed fallback without blocking success.
refresh_emergency_runtime() {
	local controller="$ROOT/scripts/emergency-control.cjs"
	local version="$(cat "$ROOT/install-state.txt" 2>/dev/null || true)"
	local manifest="$(cat "$ROOT/install-manifest.sha256" 2>/dev/null || true)"
	local output="$RECOVERY_ROOT/logs/emergency-capture-last.json"
	[ -f "$controller" ] || {
		install_event "emergency-runtime" "warning" \
			"Verified runtime lacks the emergency capture controller." \
			"root=$ROOT controller=$controller"
		return 0
	}
	mkdir -p "$(dirname "$output")"
	if AWTSMOOS_RUNTIME_VERSION="$version" AWTSMOOS_MANIFEST_SHA="$manifest" \
		node "$controller" capture "$ROOT" "$RECOVERY_ROOT" > "$output" 2>&1; then
		install_event "emergency-runtime" "passed" \
			"Sealed authenticated one-worker recovery runtime refreshed." \
			"root=$RECOVERY_ROOT/emergency-runtime/current version=$version"
		return 0
	fi
	install_event "emergency-runtime" "warning" \
		"Verified runtime remains active, but emergency slot refresh failed." \
		"receipt=$output root=$ROOT"
	return 0
}
