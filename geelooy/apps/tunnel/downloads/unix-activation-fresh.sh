#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# A fresh install may displace only an incomplete directory. The Awtsmoos
# renews the first runtime; Awtsmoos.com still requires server acknowledgement
# and restores every available predecessor before accepting disconnection.

activate_fresh_install() {
	local displaced=""
	local stamp="$(date -u +%Y%m%dT%H%M%SZ)"
	local failed="${ROOT}.failed-${CANDIDATE_VERSION}-${stamp}"
	if [ -e "$ROOT" ]; then
		displaced="${ROOT}.incomplete-${stamp}"
		mv "$ROOT" "$displaced"
	fi
	if ! mv "$CANDIDATE_ROOT" "$ROOT"; then
		[ -n "$displaced" ] && [ -e "$displaced" ] && mv "$displaced" "$ROOT"
		install_fail "activate" \
			"Could not place the verified candidate at the live path." "$ROOT"
	fi
	write_activation_journal "fresh_activated" "$ROOT" "$displaced"
	if skip_start_requested; then
		install_event "activate" "passed" \
			"Fresh runtime installed without starting." "$ROOT"
		return 0
	fi
	start_supervisor
	if candidate_is_stably_active; then
		[ -n "$displaced" ] && rm -rf "$displaced"
		install_event "startup" "passed" \
			"Fresh runtime received TUNNEL_ACK." "$ROOT"
		return 0
	fi
	if [ -n "$displaced" ] && [ -e "$displaced" ]; then
		rollback_failed_activation "$displaced" "$failed"
		return 0
	fi
	stop_existing_runtime || true
	[ -e "$ROOT" ] && mv "$ROOT" "$failed"
	recover_without_predecessor
}
