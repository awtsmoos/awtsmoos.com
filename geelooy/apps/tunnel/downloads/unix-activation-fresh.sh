#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# B"H
# A fresh install may displace only an incomplete directory, never a verified
# living runtime. Its expected version, manifest, imports, and PID must all agree.
activate_fresh_install() {
	local displaced=""
	local failed="${ROOT}.failed-${CANDIDATE_VERSION}-$(date -u +%Y%m%dT%H%M%SZ)"

	if [ -e "$ROOT" ]; then
		displaced="${ROOT}.incomplete-$(date -u +%Y%m%dT%H%M%SZ)"
		mv "$ROOT" "$displaced"
	fi

	if ! mv "$CANDIDATE_ROOT" "$ROOT"; then
		[ -n "$displaced" ] && [ -e "$displaced" ] && mv "$displaced" "$ROOT"
		install_fail "activate" "Could not place the verified candidate at the live path." "$ROOT"
	fi

	write_activation_journal "fresh_activated" "$ROOT" "$displaced"
	if skip_start_requested; then
		install_event "activate" "passed" "Fresh runtime installed without starting." "$ROOT"
		return 0
	fi

	start_supervisor
	if ! candidate_is_stably_active; then
		stop_existing_runtime || true
		[ -e "$ROOT" ] && mv "$ROOT" "$failed"
		if [ -n "$displaced" ] && [ -e "$displaced" ]; then
			mv "$displaced" "$ROOT"
			start_supervisor || true
		fi
		install_fail "startup" \
			"Fresh runtime failed its version, manifest, import, or stability gate." \
			"failed=$failed"
	fi

	[ -n "$displaced" ] && rm -rf "$displaced"
	install_event "startup" "passed" \
		"Fresh runtime matched the expected release and remained alive." "$ROOT"
}
