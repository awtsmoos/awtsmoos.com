#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Specific, actionable installer errors (Yaakov 2026-10-12, round 2):
# if anything dies, the installer says WHAT failed, WHY (the real underlying
# error), and EXACTLY what to do next. No generic "installation failed",
# no silent hangs. Sourced after unix-install-log.sh and unix-install-progress.sh.

# Phase -> concrete remediation. Every known failure phase gets a real fix,
# not a shrug.
install_remediation_for() {
	local phase="${1:-unknown}"
	case "$phase" in
		bootstrap|initial-fetch|bootstrap-fetch)
			printf '%s' 'Check your internet connection (try: curl -sSI https://awtsmoos.com | head -1). If the network is fine, awtsmoos.com may be restarting — wait 60 seconds and re-run the exact same install command. Nothing was installed or changed.' ;;
		release-metadata)
			printf '%s' 'The published release metadata could not be fetched and no verified local copy exists. Check your connection, then re-run the installer. If it keeps failing, the release may be mid-publish — wait 5 minutes and retry.' ;;
		version-policy)
			printf '%s' 'The published release is older than what is installed and the newer runtime could not be repaired. Re-run with AWTSMOOS_RESTART=1 to force a clean reinstall: curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | AWTSMOOS_RESTART=1 bash' ;;
		node-runtime)
			printf '%s' 'No usable Node.js runtime was found and none could be provisioned. Install Node.js 18 or newer (https://nodejs.org), make sure `node` is on your PATH, then re-run the installer. Minimal/agent-only modes use your system Node.' ;;
		install-lock)
			printf '%s' 'Another installer holds the install lock. If no installer is running, delete the stale lock file printed in the log above and re-run. Never delete it while an install is actually in progress.' ;;
		package-stage|bundle-download|checksum)
			printf '%s' 'The release bundle could not be downloaded or failed checksum verification. Check your connection and disk space (df -h), then re-run — the installer resumes and re-downloads cleanly.' ;;
		candidate-probe|candidate-readiness|activation)
			printf '%s' 'The new tunnel agent started but did not prove healthy in time. Check the log path printed below for the probe output, make sure no firewall blocks localhost ports, then re-run the installer.' ;;
		complete|registration|guardian|service-supervision)
			printf '%s' 'The agent installed but registration or the durable guardian did not converge. Run the health check printed in the log; if the tunnel process is running, a re-run usually converges. Otherwise re-install with AWTSMOOS_RESTART=1.' ;;
		device-login)
			printf '%s' 'Device login is best-effort and never blocks the install — the tunnel works without it. Re-run the installer (without --no-login) to get a fresh code, or pass --no-login to skip it permanently.' ;;
		disk-space)
			printf '%s' 'The disk is too full to stage the release. Free space (the installer needs ~500MB scratch) and re-run.' ;;
		permissions)
			printf '%s' 'The installer could not write to the install directory. Check ownership of the path printed in the log (chown it to your user or pick another root with AWTSMOOS_INSTALL_ROOT) and re-run.' ;;
		*)
			printf '%s' 'Re-run the same install command — most failures are transient and the installer resumes safely. If it fails twice the same way, open the log file printed below and look at the last [Awtsmoos] lines for the exact cause.' ;;
	esac
}

# The specific error card. Called by install_fail; never silent, never generic.
# (Yaakov 2026-10-14): the box ALWAYS renders beautifully — beauty is not a
# TTY privilege. Unicode borders when the locale supports UTF-8, ASCII
# otherwise; colors when the progress module detected a TTY. Long text is
# word-wrapped so the box never breaks.
print_install_error_card() {
	local phase="${1:-unknown}"
	local message="${2:-The installation failed.}"
	local detail="${3:-no further detail was recorded}"
	local logfile="${INSTALL_LOG_FILE:-${AWTSMOOS_INSTALL_RUNTIME:-/tmp}/install.jsonl}"
	local label remediation
	label="$(install_phase_label "$phase")"
	remediation="$(install_remediation_for "$phase")"
	if declare -F finish_install_progress_line >/dev/null 2>&1; then
		finish_install_progress_line
	fi

	local c_red="${PRG_C_RED:-}" c_off="${PRG_C_OFF:-}"
	local tl='+' trc='+' bl='+' brc='+' h='-' v='|' sep_l='+' sep_r='+'
	if [ "${EVT_SYM_OK:-0}" = "1" ]; then
		tl='╭'; trc='╮'; bl='╰'; brc='╯'; h='─'; v='│'; sep_l='├'; sep_r='┤'
	fi
	local width="${COLUMNS:-78}"
	case "$width" in ''|*[!0-9]*) width=78 ;; esac
	[ "$width" -gt 96 ] && width=96
	[ "$width" -lt 48 ] && width=48
	local inner=$((width - 4))

	_err_box_top() {
		local i line=""
		for ((i = 0; i < inner + 2; i++)); do line="${line}${h}"; done
		printf '%s%s%s%s%s\n' "$c_red" "$tl" "$line" "$trc" "$c_off" >&2
	}
	_err_box_bottom() {
		local i line=""
		for ((i = 0; i < inner + 2; i++)); do line="${line}${h}"; done
		printf '%s%s%s%s%s\n' "$c_red" "$bl" "$line" "$brc" "$c_off" >&2
	}
	_err_box_sep() {
		local i line=""
		for ((i = 0; i < inner + 2; i++)); do line="${line}${h}"; done
		printf '%s%s%s%s%s\n' "$c_red" "$sep_l" "$line" "$sep_r" "$c_off" >&2
	}
	_err_box_row() { # $1 = already-padded content
		printf "%s%s %-${inner}s %s%s\n" "$c_red" "$v" "$1" "$v" "$c_off" >&2
	}
	_err_box_field() { # $1 = field label, $2 = text (word-wrapped)
		local lab="$1" text="$2" first=1 chunk
		local labw=$((${#lab} + 2))
		local textw=$((inner - labw))
		[ "$textw" -lt 20 ] && textw=20
		while IFS= read -r chunk; do
			if [ "$first" = "1" ]; then
				printf "%s%s %-${labw}s%-${textw}s %s%s\n" \
					"$c_red" "$v" "${lab}:" "$chunk" "$v" "$c_off" >&2
				first=0
			else
				printf "%s%s %-${labw}s%-${textw}s %s%s\n" \
					"$c_red" "$v" "" "$chunk" "$v" "$c_off" >&2
			fi
		done < <(printf '%s\n' "$text" | fold -s -w "$textw")
		[ "$first" = "1" ] && _err_box_row "${lab}:"
	}

	local cross='X'
	[ "${EVT_SYM_OK:-0}" = "1" ] && cross='✕'
	printf '\n' >&2
	_err_box_top
	_err_box_row "${cross} INSTALLATION FAILED"
	_err_box_row "Phase: ${label}"
	_err_box_sep
	_err_box_field "What" "$message"
	_err_box_field "Why" "$detail"
	_err_box_field "Fix" "$remediation"
	_err_box_field "Log" "$logfile"
	_err_box_bottom
}

# Run a command with errexit disabled so an internal failure surfaces as a
# return code instead of killing the whole installer silently. (Yaakov
# 2026-10-14: a set -e death inside the release-check phase dropped back to
# the shell prompt with no error at all — every failure must reach the
# beautiful error card instead.) set -u and pipefail stay on.
without_errexit() {
	set +e
	"$@"
	local rc=$?
	set -e
	[ "$rc" -eq 0 ]
}

# Run a command with a hard timeout. Usage:
#   run_with_timeout <seconds> <label> -- <command> [args...]
# Returns 124 with a clear message on timeout; otherwise the command's status.
# No silent hangs: every bounded wait in the installer should go through this.
run_with_timeout() {
	local seconds="${1:-60}" label="${2:-operation}"
	shift 2
	[ "${1:-}" = "--" ] && shift
	if command -v timeout >/dev/null 2>&1; then
		local rc=0
		timeout "$seconds" "$@" || rc=$?
		if [ "$rc" -eq 124 ]; then
			prg_warn "Timed out after ${seconds}s waiting for: $label — continuing without it."
			return 124
		fi
		return "$rc"
	fi
	# Portable fallback (macOS has no GNU timeout): background watcher kills it.
	local flag="${AWTSMOOS_INSTALL_RUNTIME:-/tmp}/timeout-$$.flag"
	rm -f "$flag"
	local rc=0 pid watcher timed_out=0
	"$@" &
	pid=$!
	( sleep "$seconds" && touch "$flag" && kill -9 "$pid" 2>/dev/null ) &
	watcher=$!
	wait "$pid" 2>/dev/null || rc=$?
	kill "$watcher" 2>/dev/null
	wait "$watcher" 2>/dev/null
	[ -f "$flag" ] && timed_out=1
	rm -f "$flag"
	if [ "$timed_out" -eq 1 ]; then
		prg_warn "Timed out after ${seconds}s waiting for: $label — continuing without it."
		return 124
	fi
	return "$rc"
}
