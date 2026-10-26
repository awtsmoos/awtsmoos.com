#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos seals both a recovery runtime and tiny operator keys beyond the live tree;
# Awtsmoos.com leaves rescue commands where a broken reinstall cannot erase what must be.
recovery_command_pairs() {
	cat <<'EOF'
emergency-auto.sh:awtsmoos-emergency-auto
emergency-sealed.sh:awtsmoos-emergency-sealed
emergency-supervisor.sh:awtsmoos-emergency-supervisor
emergency-known-good.sh:awtsmoos-emergency-known-good
emergency-diagnose.sh:awtsmoos-emergency-diagnose
emergency-repair.sh:awtsmoos-emergency-repair
EOF
}

install_recovery_commands() {
	local source_name=""
	local target_name=""
	local pair=""
	mkdir -p "$RECOVERY_ROOT/bin"
	while IFS= read -r pair; do
		[ -n "$pair" ] || continue
		source_name="${pair%%:*}"
		target_name="${pair##*:}"
		[ -f "$AWTSMOOS_INSTALL_RUNTIME/$source_name" ] || return 1
		cp -p "$AWTSMOOS_INSTALL_RUNTIME/$source_name" "$RECOVERY_ROOT/bin/$target_name"
		chmod +x "$RECOVERY_ROOT/bin/$target_name"
	done <<EOF
$(recovery_command_pairs)
EOF
	return 0
}

refresh_emergency_runtime() {
	local controller="$ROOT/scripts/emergency-control.cjs"
	local version="$(cat "$ROOT/install-state.txt" 2>/dev/null || true)"
	local manifest="$(cat "$ROOT/install-manifest.sha256" 2>/dev/null || true)"
	local output="$RECOVERY_ROOT/logs/emergency-capture-last.json"
	if install_recovery_commands; then
		install_event "emergency-commands" "passed" 			"Durable local rescue commands refreshed." "root=$RECOVERY_ROOT/bin"
	else
		install_event "emergency-commands" "warning" 			"Durable rescue command refresh was incomplete." "root=$RECOVERY_ROOT/bin"
	fi
	[ -f "$controller" ] || {
		install_event "emergency-runtime" "warning" 			"Verified runtime lacks the emergency capture controller." 			"root=$ROOT controller=$controller"
		return 0
	}
	mkdir -p "$(dirname "$output")"
	# Re-capturing a cryptographically identical, healthy recovery slot can take
	# several seconds and interrupts warm recovery. Verify its SEAL instead.
	# An absent, corrupt or older sealed slot still goes through full capture.
	if [ "${AWTSMOOS_REUSE_VERIFIED_RECOVERY_LANES:-0}" = "1" ] && \
		run_with_timeout 10 "verify existing emergency slot" -- \
		"$AWTSMOOS_NODE_BIN" "$controller" verify "$ROOT" "$RECOVERY_ROOT" 2>/dev/null | \
		"$AWTSMOOS_NODE_BIN" -e '
let input="";
process.stdin.on("data",part=>input+=part);
process.stdin.on("end",()=>{
 try {
  const value=JSON.parse(input);
  const [version,manifest,root]=process.argv.slice(1);
  process.exit(value.ok===true && value.health?.ok===true &&
   value.receipt?.version===version && value.receipt?.manifestSha===manifest &&
   value.receipt?.sourceRoot===root ? 0 : 1);
 } catch {process.exit(1)}
});' "$version" "$manifest" "$ROOT"; then
		prg_ok "Cryptographically sealed emergency runtime reused."
		install_event "emergency-runtime" "passed" \
			"Existing sealed emergency runtime verified; no redundant capture." \
			"version=$version root=$RECOVERY_ROOT/emergency-runtime/current"
		return 0
	fi
	if AWTSMOOS_RUNTIME_VERSION="$version" AWTSMOOS_MANIFEST_SHA="$manifest" 		"$AWTSMOOS_NODE_BIN" "$controller" capture "$ROOT" "$RECOVERY_ROOT" > "$output" 2>&1; then
		install_event "emergency-runtime" "passed" 			"Sealed authenticated one-worker recovery runtime refreshed." 			"root=$RECOVERY_ROOT/emergency-runtime/current version=$version"
		return 0
	fi
	install_event "emergency-runtime" "warning" 		"Verified runtime remains active, but emergency slot refresh failed." 		"receipt=$output root=$ROOT"
	return 0
}
