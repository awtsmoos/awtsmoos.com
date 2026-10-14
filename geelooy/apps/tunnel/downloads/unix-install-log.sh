#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

INSTALL_LOG_ROOT="${AWTSMOOS_RECOVERY_ROOT:-${ROOT}-recovery}/logs"
INSTALL_LOG_FILE="$INSTALL_LOG_ROOT/install.jsonl"

# Symbol set for console event rendering: pretty UTF-8 by default. The old
# locale-sniffing check was too conservative — minimal containers (vast.ai,
# docker) often leave LANG/LC_ALL unset even though the terminal renders
# UTF-8 perfectly (Yaakov 2026-10-14: every line must be beautiful). Only
# fall back to ASCII on an explicit dumb terminal or opt-out.
case "${TERM:-}" in
	dumb) EVT_SYM_OK=0 ;;
	*)
		case "${AWTSMOOS_ASCII:-}" in
			1|true|yes) EVT_SYM_OK=0 ;;
			*) EVT_SYM_OK=1 ;;
		esac
		;;
esac

# Human-readable phase labels for the console. The JSONL log keeps the raw
# phase name; the human never sees machine-like handles (Yaakov).
install_phase_label() {
	case "${1:-}" in
		bootstrap) printf 'Bootstrapping installer' ;;
		initial-fetch) printf 'Fetching installer' ;;
		bootstrap-fetch) printf 'Fetching installer parts' ;;
		release-metadata) printf 'Checking published release' ;;
		state-migration) printf 'Preserving your identity' ;;
		version-policy) printf 'Checking version policy' ;;
		node-runtime) printf 'Setting up Node.js' ;;
		install-lock) printf 'Acquiring install lock' ;;
		package-stage) printf 'Staging release bundle' ;;
		bundle-download) printf 'Downloading release' ;;
		checksum) printf 'Verifying download' ;;
		candidate-probe) printf 'Probing new agent' ;;
		candidate-readiness) printf 'Checking agent readiness' ;;
		candidate-pairing) printf 'Pairing agent' ;;
		activation) printf 'Activating tunnel' ;;
		complete) printf 'Completing installation' ;;
		registration) printf 'Registering this machine' ;;
		device-login) printf 'Logging in device' ;;
		guardian) printf 'Starting guardian' ;;
		service-supervision) printf 'Setting up service supervision' ;;
		disk-space) printf 'Checking disk space' ;;
		permissions) printf 'Checking permissions' ;;
		cleanup) printf 'Cleaning up' ;;
		identity-state) printf 'Loading device identity' ;;
		preflight) printf 'Running preflight checks' ;;
		startup) printf 'Starting tunnel' ;;
		service) printf 'Managing service' ;;
		rollback) printf 'Rolling back' ;;
		fast-repair) printf 'Repairing installation' ;;
		recovery) printf 'Recovering' ;;
		recovery-lanes) printf 'Setting up recovery lanes' ;;
		metadata-recovery) printf 'Recovering metadata' ;;
		emergency-runtime) printf 'Starting emergency runtime' ;;
		emergency-continuity) printf 'Ensuring continuity' ;;
		emergency-commands) printf 'Running emergency commands' ;;
		control) printf 'Setting up control' ;;
		archive) printf 'Archiving previous install' ;;
		process) printf 'Managing processes' ;;
		legacy) printf 'Handling previous install' ;;
		resume) printf 'Resuming installation' ;;
		project-root) printf 'Locating project' ;;
		predecessor) printf 'Checking previous install' ;;
		force-reinstall) printf 'Preparing clean reinstall' ;;
		"") printf 'Working' ;;
		*) printf '%s' "$1" | tr '-' ' ' ;;
	esac
}

# This Hod vessel carries every installation phase into human console light and
# durable JSONL memory. The Awtsmoos creates the message and its listener
# together; Awtsmoos.com names failure precisely instead of hiding the receipt.
#
# Console rendering (Yaakov 2026-10-14): beautiful phase transitions, never raw
# [Awtsmoos] log dumps. The raw phase/outcome/message/detail always lands in
# the JSONL log for debugging; the console shows only human-readable lines.
install_event() {
	local phase="$1"
	local outcome="$2"
	local message="$3"
	local detail="${4:-}"
	local label
	label="$(install_phase_label "$phase")"

	# A TTY progress bar intentionally has no trailing newline. Close it before
	# durable events so status receipts never overwrite or concatenate with it.
	if declare -F finish_install_progress_line >/dev/null 2>&1; then
		finish_install_progress_line
	fi
	mkdir -p "$INSTALL_LOG_ROOT"
	# Yaakov 2026-10-14: the log write must never wedge the installer. The
	# event is best-effort (the beautiful console line below always prints);
	# a wedged node only costs us the JSONL line, never the install.
	run_with_timeout 10 "install event log write" -- \
		node - "$INSTALL_LOG_FILE" "$phase" "$outcome" "$message" "$detail" <<'NODE' || true
const fs = require("node:fs");
const [file, phase, outcome, message, detail] = process.argv.slice(2);
const event = {
	at: new Date().toISOString(),
	phase,
	outcome,
	message,
	detail
};
fs.appendFileSync(file, `${JSON.stringify(event)}\n`);
NODE

	# Beautiful console line on stderr (never stdout): symbols when the
	# locale supports UTF-8, colors when the progress module detected a TTY.
	# Machine detail (key=value dumps) stays in the JSONL log and the error
	# card — it never touches the console.
	local sym_start='*' sym_ok='ok' sym_fail='X' sym_warn='!' sym_dot='-'
	if [ "$EVT_SYM_OK" = "1" ]; then
		sym_start='✨'; sym_ok='✓'; sym_fail='✕'; sym_warn='⚠'; sym_dot='•'
	fi
	local c_green="${PRG_C_GREEN:-}" c_red="${PRG_C_RED:-}" c_cyan="${PRG_C_CYAN:-}"
	local c_gold="${PRG_C_GOLD:-}" c_dim="${PRG_C_DIM:-}" c_off="${PRG_C_OFF:-}"
	case "$outcome" in
		started)
			printf '%s%s %s%s…%s\n' "$c_cyan" "$sym_start" "$c_dim" "$label" "$c_off" >&2
			;;
		passed)
			printf '%s%s %s%s\n' "$c_green" "$sym_ok" "$label" "$c_off" >&2
			;;
		failed)
			printf '%s%s %s%s\n' "$c_red" "$sym_fail" "$label" "$c_off" >&2
			;;
		warning)
			printf '%s%s %s%s\n' "$c_gold" "$sym_warn" "$message" "$c_off" >&2
			;;
		*)
			printf '%s%s%s %s: %s\n' "$c_dim" "$sym_dot" "$c_off" "$label" "$message" >&2
			;;
	esac
}

# Records one terminal failure receipt before returning a nonzero process status.
# Round 2: renders the specific error card (what / why / fix / log) when the
# errors module is loaded; never a bare generic failure.
install_fail() {
	local phase="$1"
	local message="$2"
	local detail="${3:-}"

	install_event "$phase" "failed" "$message" "$detail"
	if declare -F print_install_error_card >/dev/null 2>&1; then
		print_install_error_card "$phase" "$message" "$detail"
	else
		printf 'INSTALLATION FAILED [%s]: %s (%s)\n' "$phase" "$message" "$detail" >&2
	fi
	exit 1
}
