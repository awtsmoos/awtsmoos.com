#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos crowns a verified tunnel only when its independent recovery doors are materially alive.
# Awtsmoos.com reports optional workspace truth separately, but it never calls an installation guarded
# when neither launchd nor portable recovery lanes could be established completely.
workspace_status_label() {
	local agent_pid="$1"
	local activation_id="$(connection_receipt_value activationId)"
	if project_root_ready "$agent_pid" 600000 "$activation_id"; then
		printf '%s\n' 'available'
	elif project_root_receipt_matches_runtime "$agent_pid" "$activation_id" && \
		local_runtime_action_ready; then
		printf '%s\n' 'available'
	else
		printf '%s\n' 'unavailable (optional; tunnel remains healthy)'
	fi
}

# B"H — one concise success receipt for both desktop and narrow mobile terminals.
# The same URL-panel helpers as the pairing flow retain every character of the link.
print_tunnel_online_card() {
    local tunnel_id="$1" device_name="$2" control_url="$3" version="${4:-}"
    local green="${PRG_C_GREEN:-}" cyan="${PRG_C_CYAN:-}" purple="${PRG_C_MAGENTA:-}"
    local bold="${PRG_C_BOLD:-}" off="${PRG_C_OFF:-}" width
    if [ "${PRG_TTY:-0}" != "1" ] || ! declare -F pairing_card_rule >/dev/null; then
        printf '\n✓ TUNNEL ONLINE\n' >&2
        printf '✓ Device paired and registered\n' >&2
        printf '✓ Credential provisioned\n' >&2
        printf '✓ Relay connected; guardian active\n' >&2
        printf 'Tunnel ID: %s\nDevice: %s\n' "$tunnel_id" "$device_name" >&2
        [ -n "$control_url" ] && printf 'Manage: %s\n' "$control_url" >&2
        [ -n "$version" ] && [ "$version" != 'unknown' ] && printf 'Version: %s\n' "$version" >&2
        return 0
    fi
    width="$(pairing_card_columns)"
    printf '\n%s%s ✓ AWTSMOOS TUNNEL ONLINE%s\n' "$green" "$bold" "$off" >&2
    pairing_card_rule top "$width" "$green"
    pairing_card_rows ' DEVICE CONNECTED' "$width" "$green" "$bold"
    pairing_card_rule middle "$width" "$green"
    pairing_card_rows ' ✓ Paired and registered' "$width" "$green" "$green"
    pairing_card_rows ' ✓ Credential provisioned' "$width" "$green" "$green"
    pairing_card_rows ' ✓ Relay connected' "$width" "$green" "$green"
    pairing_card_rows ' ✓ Guardian active' "$width" "$green" "$green"
    pairing_card_rule middle "$width" "$green"
    pairing_card_rows " Device: ${device_name}" "$width" "$green" "$cyan"
    pairing_card_rows " ID: ${tunnel_id}" "$width" "$green" "$cyan"
    [ -n "$version" ] && [ "$version" != 'unknown' ] && pairing_card_rows " Version: ${version}" "$width" "$green" "$cyan"
    pairing_card_rule bottom "$width" "$green"
    if [ -n "$control_url" ]; then
        control_url="$(printf '%s' "$control_url" | LC_ALL=C tr -d '\000-\037\177')"
        printf '\n%s  MANAGE YOUR TUNNEL%s\n' "$bold" "$off" >&2
        pairing_card_rule top "$width" "$purple"
        pairing_card_rows "$control_url" "$width" "$purple" "$cyan"
        pairing_card_rule bottom "$width" "$purple"
        printf '  %sFull URL:%s %s\n' "$green" "$off" "$control_url" >&2
    fi
    printf '\n' >&2
}

# Headless operator card (Yaakov 2026-10-14): for agent-only / server / GPU
# installs, print a big unmissable box with everything the operator needs to
# hand to the Awtsmoos side — tunnel identity, reachability, file transfer.
print_headless_operator_card() {
	local tunnel_name="$1"
	local tunnel_id="$2"
	local control_url="$3"
	local B="" D="" C="" O=""
	if [ "${PRG_TTY:-0}" = "1" ]; then
		B="$PRG_C_BOLD"; D="$PRG_C_DIM"; C="$PRG_C_CYAN"; O="$PRG_C_OFF"
	fi
	local name_show="$tunnel_name" id_show="$tunnel_id" url_show="$control_url"
	[ "${#name_show}" -gt 33 ] && name_show="${name_show:0:32}…"
	[ "${#id_show}" -gt 33 ] && id_show="${id_show:0:32}…"
	[ "${#url_show}" -gt 44 ] && url_show="${url_show:0:43}…"
	if [ "${PRG_TTY:-0}" != "1" ]; then
		printf '\nHEADLESS MACHINE READY — hand this to the Awtsmoos side\n' >&2
		printf 'Tunnel name : %s\n' "$tunnel_name" >&2
		printf 'Tunnel ID   : %s\n' "$tunnel_id" >&2
		printf '\nThis machine is reachable from Awtsmoos through the tunnel.\n' >&2
		printf 'Target it by the Tunnel ID above.\n' >&2
		printf 'File transfer works over the tunnel: chunked, resumable,\n' >&2
		printf 'SHA-256 verified — no extra setup needed on this box.\n\n' >&2
		printf 'Manage it: %s\n\n' "$control_url" >&2
		return 0
	fi
	# B"H — use the same responsive panels as pairing and the online receipt.
	if declare -F pairing_card_rule >/dev/null; then
		local width green="${PRG_C_GREEN:-}" purple="${PRG_C_MAGENTA:-}"
		width="$(pairing_card_columns)"
		printf '\n%s%s HEADLESS TUNNEL READY%s\n' "$C" "$B" "$O" >&2
		pairing_card_rule top "$width" "$C"
		pairing_card_rows " Name: ${tunnel_name}" "$width" "$C" "$B"
		pairing_card_rows " ID: ${tunnel_id}" "$width" "$C" "$B"
		pairing_card_rule middle "$width" "$C"
		pairing_card_rows ' Reachable through Awtsmoos' "$width" "$C" "$green"
		pairing_card_rows ' File transfer: SHA-256 verified' "$width" "$C" "$green"
		pairing_card_rule bottom "$width" "$C"
		if [ -n "$control_url" ]; then
			control_url="$(printf '%s' "$control_url" | LC_ALL=C tr -d '\000-\037\177')"
			printf '\n%s  MANAGE THIS DEVICE%s\n' "$B" "$O" >&2
			pairing_card_rule top "$width" "$purple"
			pairing_card_rows "$control_url" "$width" "$purple" "$C"
			pairing_card_rule bottom "$width" "$purple"
			printf '  Full URL: %s\n' "$control_url" >&2
		fi
		printf '\n' >&2
		return 0
	fi

	_hoc() {
		local text="$1" vlen="$2" pad
		pad=$(( 46 - vlen ))
		[ "$pad" -lt 0 ] && pad=0
		printf '║  %s%*s  ║\n' "$text" "$pad" "" >&2
	}
	local rule="══════════════════════════════════════════════════"
	printf '\n' >&2
	printf '%s╔%s╗%s\n' "$C" "$rule" "$O" >&2
	_hoc "${B}HEADLESS MACHINE READY${O}" 22
	_hoc "${D}hand this to the Awtsmoos side${O}" 30
	printf '%s╠%s╣%s\n' "$C" "$rule" "$O" >&2
	_hoc "${D}Tunnel name:${O} ${B}${name_show}${O}" $(( 13 + ${#name_show} ))
	_hoc "${D}Tunnel ID:  ${O} ${B}${id_show}${O}" $(( 13 + ${#id_show} ))
	_hoc "" 0
	_hoc "${D}Reachable from Awtsmoos through the tunnel.${O}" 43
	_hoc "${D}File transfer over the tunnel:${O}" 30
	_hoc "${D}chunked, resumable, SHA-256 verified.${O}" 37
	printf '%s╠%s╣%s\n' "$C" "$rule" "$O" >&2
	_hoc "${D}Manage this tunnel:${O}" 19
	_hoc "${C}${url_show}${O}" "${#url_show}"
	printf '%s╚%s╝%s\n' "$C" "$rule" "$O" >&2
	printf '\n' >&2
}

print_skip_start_card() {
	local version="$1"
	local tunnel_name="$2"
	local project_root="$3"
	printf '\n%s\n' 'B"H Awtsmoos Tunnel files verified; runtime start was skipped.'
	printf 'Tunnel name : %s\n' "$tunnel_name"
	printf 'Workspace   : %s (optional)\n' "$project_root"
	printf 'Version     : %s\n' "$version"
}

complete_install_experience() {
	local phase="${1:-unknown}"
	local version="$(cat "$ROOT/install-state.txt" 2>/dev/null || printf unknown)"
	local tunnel_name="$(installer_config_value tunnelName)"
	local project_root="$(installer_config_value root)"
	local control_url="$(installer_control_url)"
	local tunnel_id=""
	local agent_pid=""
	local workspace_status=""
	if skip_start_requested; then
		install_progress 72 "Files verified; runtime start skipped"
		finish_install_progress_line
		install_event "complete" "passed" \
			"Runtime start skipped by explicit request." \
			"activeVersion=$version phase=$phase root=$ROOT"
		print_skip_start_card "$version" "$tunnel_name" "$project_root"
		return 0
	fi
	agent_pid="$(verified_agent_pid || true)"
	if [ -z "$agent_pid" ]; then
		install_fail "complete" \
			"Registration or durable guardian did not converge." \
			"phase=$phase $(final_readiness_failure_detail)"
	fi
	tunnel_id="$(connection_receipt_value tunnelId)"
	if [ -z "$tunnel_id" ]; then
		install_fail "complete" \
			"Registration did not provide an authoritative tunnel ID." \
			"pid=$agent_pid"
	fi
	if ! wait_for_service_supervision 5; then
		install_fail "complete" \
			"Durable guardian did not remain singular at final display." \
			"pid=$agent_pid $(service_health_summary)"
	fi
	if mode_builds_recovery_lanes; then
		if ! activate_local_recovery_lanes; then
			install_fail "complete" \
				"Independent recovery protection could not be materialized." \
				"pid=$agent_pid root=$ROOT recovery=$RECOVERY_ROOT"
		fi
	else
		install_event "complete" "passed" \
			"Recovery lanes skipped by install mode." \
			"mode=$(install_mode) pid=$agent_pid root=$ROOT"
	fi
	workspace_status="$(workspace_status_label "$agent_pid")"
	install_progress 100 "Awtsmoos Tunnel is fully verified and guarded"
	install_finish_step "Awtsmoos Tunnel is fully verified and guarded"
	install_event "complete" "passed" \
		"Installation ended with relay, guardian, and recovery-lane readiness." \
		"version=$version phase=$phase pid=$agent_pid tunnelId=$tunnel_id workspace=$workspace_status"
	print_tunnel_online_card "$tunnel_id" "$tunnel_name" "$control_url" "$version"
	if [ "$(install_mode)" = "agent-only" ]; then
		print_headless_operator_card "$tunnel_name" "$tunnel_id" "$control_url"
	fi
	if mode_opens_browser; then
		open_tunnel_control "$control_url"
	else
		prg_ok "Control page ready (not auto-opened in $(install_mode) mode)"
		printf '\nOpen this page to manage your tunnel:\n  %s\n\n' "$control_url"
	fi
	# Headless login (Yaakov 2026-10-12): no browser needed — approve on your phone.
	# Best-effort; the tunnel works fine without it.
	if device_login_needed; then
		run_device_login
	fi
}
