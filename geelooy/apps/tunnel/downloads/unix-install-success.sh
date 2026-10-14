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

print_install_success_card() {
	local version="$1"
	local tunnel_name="$2"
	local tunnel_id="$3"
	local project_root="$4"
	local workspace_status="$5"
	local control_url="$6"
	local B="" G="" D="" O=""
	if [ "${PRG_TTY:-0}" = "1" ]; then
		B="$PRG_C_BOLD"; G="$PRG_C_GREEN"; D="$PRG_C_DIM"; O="$PRG_C_OFF"
	fi
	printf '\n%s\n' "${G}============================================================${O}"
	printf '%s\n' "${B}B\"H  AWTSMOOS TUNNEL VERIFIED, GUARDED, AND CONNECTED${O}"
	printf '%s\n' "${G}============================================================${O}"
	printf 'Tunnel name : %s%s%s\n' "$B" "$tunnel_name" "$O"
	printf 'Tunnel ID   : %s\n' "$tunnel_id"
	printf 'Workspace   : %s\n' "$project_root"
	printf 'Workspace   : %s\n' "$workspace_status"
	printf 'Guardian    : %s\n' "$(service_health_summary)"
	printf 'Version     : %s\n' "$version"
	printf 'Control     : %s\n\n' "$control_url"
	printf '%s\n' "${D}Remote access — this machine is reachable from Awtsmoos:${O}"
	printf '  Target it by Tunnel ID: %s%s%s\n' "$B" "$tunnel_id" "$O"
	printf '  File transfer: native chunked + resumable transfer over the tunnel\n'
	printf '                 (per-chunk SHA-256, auto-resume, atomic commit).\n'
	printf '  Agents on the Awtsmoos side can push and pull files to this\n'
	printf '  machine through the tunnel without any extra setup.\n\n'
	printf '%s\n' "${D}Durable local repair:${O}"
	printf '%s\n' "$ROOT/awtsmoos-tunnel-service.sh repair"
	printf '%s\n' "${D}Universal self-healing reinstall or upgrade:${O}"
	printf '%s\n' 'curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | AWTSMOOS_RESTART=1 bash'
	printf '%s\n' "${G}============================================================${O}"
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
	printf '\n%s\n' "${C}============================================================${O}"
	printf '%s\n' "${B}  HEADLESS MACHINE READY — hand this to the Awtsmoos side${O}"
	printf '%s\n' "${C}============================================================${O}"
	printf '  Tunnel name : %s%s%s\n' "$B" "$tunnel_name" "$O"
	printf '  Tunnel ID   : %s%s%s\n' "$B" "$tunnel_id" "$O"
	printf '\n'
	printf '  %sThis machine is reachable from Awtsmoos through the tunnel.%s\n' "$D" "$O"
	printf '  %sTarget it by the Tunnel ID above.%s\n' "$D" "$O"
	printf '  %sFile transfer works over the tunnel: chunked, resumable,%s\n' "$D" "$O"
	printf '  %sSHA-256 verified — no extra setup needed on this box.%s\n' "$D" "$O"
	printf '\n'
	printf '  Manage it: %s\n' "$control_url"
	printf '%s\n' "${C}============================================================${O}"
	printf '\n'
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
	print_install_success_card "$version" "$tunnel_name" "$tunnel_id" \
		"$project_root" "$workspace_status" "$control_url"
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
