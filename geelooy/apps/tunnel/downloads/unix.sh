#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -Eeuo pipefail
export LC_ALL=C
export LANG=C

# The Awtsmoos chooses the primary vessel before replaceable helpers are trusted;
# Awtsmoos.com lets one wounded public doorway retry quietly instead of becoming a curl storm.
origin="${AWTSMOOS_INSTALL_ORIGIN:-https://awtsmoos.com}"
origin="${origin%/}"
canonical_root="$HOME/.awtsmoos-tunnel"
recovery_hint="${AWTSMOOS_RECOVERY_ROOT:-$HOME/.awtsmoos-tunnel-recovery}"

# --- Clever terminal presentation (Yaakov 2026-10-11: the install command must look smart) ---
# --- Colorful & fun (Yaakov 2026-10-13: make it more colorful and fun!) ---
if [ -t 2 ] && [ "${NO_COLOR:-}" != "1" ] && [ "${TERM:-}" != "dumb" ]; then
	AWT_C_BOLD=$'\033[1m'; AWT_C_DIM=$'\033[2m'; AWT_C_GOLD=$'\033[1;33m'
	AWT_C_GREEN=$'\033[1;32m'; AWT_C_RED=$'\033[1;31m'; AWT_C_CYAN=$'\033[1;36m'
	AWT_C_MAGENTA=$'\033[1;35m'; AWT_C_BLUE=$'\033[1;34m'; AWT_C_YELLOW=$'\033[1;93m'
	AWT_C_PINK=$'\033[1;95m'; AWT_C_ORANGE=$'\033[38;5;208m'; AWT_C_PURPLE=$'\033[38;5;141m'
	AWT_C_TEAL=$'\033[38;5;51m'; AWT_C_LIME=$'\033[38;5;118m'
	AWT_C_OFF=$'\033[0m'
	AWT_COLORFUL=1
else
	AWT_C_BOLD=''; AWT_C_DIM=''; AWT_C_GOLD=''; AWT_C_GREEN=''; AWT_C_RED=''; AWT_C_CYAN=''
	AWT_C_MAGENTA=''; AWT_C_BLUE=''; AWT_C_YELLOW=''; AWT_C_PINK=''; AWT_C_ORANGE=''
	AWT_C_PURPLE=''; AWT_C_TEAL=''; AWT_C_LIME=''; AWT_C_OFF=''
	AWT_COLORFUL=0
fi

# Rainbow text: prints each character in cycling rainbow colors
awt_rainbow() {
	local text="$1" i=0 char
	local colors=("$AWT_C_RED" "$AWT_C_ORANGE" "$AWT_C_YELLOW" "$AWT_C_LIME" "$AWT_C_TEAL" "$AWT_C_BLUE" "$AWT_C_PURPLE" "$AWT_C_PINK")
	if [ "$AWT_COLORFUL" != "1" ]; then printf '%s' "$text"; return 0; fi
	while [ $i -lt ${#text} ]; do
		char="${text:$i:1}"
		printf '%s%s%s' "${colors[$((i % 8))]}" "$char" "$AWT_C_OFF"
		i=$((i + 1))
	done
}

# Animated spinner for long operations (runs in background, kill with PID)
awt_spinner() {
	local msg="$1" pid_file="$2"
	local frames=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
	local i=0
	if [ "$AWT_COLORFUL" != "1" ]; then printf '%s...\n' "$msg" >&2; return 0; fi
	while kill -0 "$$" 2>/dev/null; do
		printf '\r%s%s%s %s' "$AWT_C_CYAN" "${frames[$((i % 10))]}" "$AWT_C_OFF" "$msg" >&2
		i=$((i + 1))
		sleep 0.1
	done &
	printf '%s' "$!" > "$pid_file"
}

awt_spinner_stop() {
	local pid_file="$1" final_msg="${2:-}"
	if [ -f "$pid_file" ]; then
		kill "$(cat "$pid_file")" 2>/dev/null
		rm -f "$pid_file"
		printf '\r\033[2K' >&2
		[ -n "$final_msg" ] && awt_ok "$final_msg"
	fi
}

# Fun ASCII art celebrations
awt_celebrate() {
	if [ "$AWT_COLORFUL" = "1" ]; then
		cat >&2 <<EOF

${AWT_C_YELLOW}  ✨  ${AWT_C_GREEN}🎉  ${AWT_C_PINK}✨  ${AWT_C_CYAN}🎊  ${AWT_C_YELLOW}✨  ${AWT_C_GREEN}🎉  ${AWT_C_PINK}✨  ${AWT_C_CYAN}🎊  ${AWT_C_YELLOW}✨${AWT_C_OFF}
EOF
		awt_rainbow "  ★  INSTALLATION COMPLETE! Welcome to the Awtsmoos!  ★"
		printf '\n' >&2
		cat >&2 <<EOF
${AWT_C_YELLOW}  ✨  ${AWT_C_GREEN}🎉  ${AWT_C_PINK}✨  ${AWT_C_CYAN}🎊  ${AWT_C_YELLOW}✨  ${AWT_C_GREEN}🎉  ${AWT_C_PINK}✨  ${AWT_C_CYAN}🎊  ${AWT_C_YELLOW}✨${AWT_C_OFF}

EOF
	else
		printf '\n*** INSTALLATION COMPLETE! Welcome to the Awtsmoos! ***\n\n' >&2
	fi
}

awt_magic_wand() {
	if [ "$AWT_COLORFUL" = "1" ]; then
		printf '%s  🪄  %s' "$AWT_C_PURPLE" "$AWT_C_OFF" >&2
	fi
}

awt_intro_box() {
	local mode="${1:-full}"
	if [ "$AWT_COLORFUL" = "1" ]; then
		cat >&2 <<EOF

${AWT_C_PURPLE}  ╭──────────────────────────────────────────────────╮${AWT_C_OFF}
${AWT_C_PURPLE}  │${AWT_C_OFF}                                                  ${AWT_C_PURPLE}│${AWT_C_OFF}
EOF
		printf '%s  │%s   🪄  ' "$AWT_C_PURPLE" "$AWT_C_OFF" >&2
		awt_rainbow "AWTSMOOS TUNNEL"
		printf '%s  — installer ✨%s%s│%s\n' "$AWT_C_BOLD" "$AWT_C_OFF" "$AWT_C_PURPLE" "$AWT_C_OFF" >&2
		cat >&2 <<EOF
${AWT_C_PURPLE}  │${AWT_C_OFF}                                                  ${AWT_C_PURPLE}│${AWT_C_OFF}
${AWT_C_PURPLE}  │${AWT_C_OFF}      ${AWT_C_DIM}your magical doorway to every machine${AWT_C_OFF}        ${AWT_C_PURPLE}│${AWT_C_OFF}
${AWT_C_PURPLE}  │${AWT_C_OFF}      Mode: ${AWT_C_CYAN}${mode}${AWT_C_OFF} · Ctrl+C cancels cleanly        ${AWT_C_PURPLE}│${AWT_C_OFF}
${AWT_C_PURPLE}  │${AWT_C_OFF}                                                  ${AWT_C_PURPLE}│${AWT_C_OFF}
${AWT_C_PURPLE}  ╰──────────────────────────────────────────────────╯${AWT_C_OFF}

${AWT_C_DIM}  Let's get you connected... 🚀${AWT_C_OFF}
EOF
	else
		printf '\n== AWTSMOOS TUNNEL installer (mode: %s) ==\nCtrl+C cancels cleanly.\n' "$mode" >&2
	fi
}

awt_banner() {
	cat >&2 <<EOF
${AWT_C_GOLD}  ✦  ${AWT_C_BOLD}AWTSMOOS TUNNEL${AWT_C_OFF}${AWT_C_GOLD}  ✦${AWT_C_OFF}
${AWT_C_DIM}  ── secure doorway to your machines ──${AWT_C_OFF}
EOF
}

awt_step()  { printf '%s🚀%s %s\n'   "$AWT_C_CYAN" "$AWT_C_OFF" "$1" >&2; }
awt_ok()    { printf '%s✨%s %s\n'   "$AWT_C_GREEN" "$AWT_C_OFF" "$1" >&2; }
awt_warn()  { printf '%s⚠️%s %s\n'   "$AWT_C_YELLOW" "$AWT_C_OFF" "$1" >&2; }
awt_fail()  { printf '%s💥%s %s\n'   "$AWT_C_RED" "$AWT_C_OFF" "$1" >&2; }
awt_dim()   { printf '%s%s%s\n'     "$AWT_C_DIM" "$1" "$AWT_C_OFF" >&2; }
awt_fun()   { printf '%s🎭%s %s\n'   "$AWT_C_PINK" "$AWT_C_OFF" "$1" >&2; }

# --- Install modes (Yaakov 2026-10-12): full / minimal / agent-only ---
# Backward compatible: no flags + non-interactive => full (today's behavior).
AWTSMOOS_INSTALL_MODE="${AWTSMOOS_INSTALL_MODE:-}"
AWT_ASSUME_YES=0
# Yaakov 2026-10-14: rerunning the installer must clear everything — no
# manual pkill/rm ever. --clean does a full wipe first; --agent-only implies it.
AWTSMOOS_INSTALL_CLEAN="${AWTSMOOS_INSTALL_CLEAN:-0}"

print_installer_help() {
	cat >&2 <<EOF
${AWT_C_DIM}  ── secure doorway to your machines ──${AWT_C_OFF}

Usage: curl -fsSL $origin/api/tunnel/install/unix | bash -s -- [options]

Options:
  --full            Complete tunnel: agent, guardian, recovery lanes, browser support (default)
  --minimal         Agent + registration; uses your system Node.js 18+; no browser auto-open
  --agent-only      Fastest headless install for servers; no browser, no recovery lanes
  --clean           Kill all tunnel processes and clear all local state first (implied by --agent-only)
  --mode=MODE       Same as --MODE (full, minimal, agent-only)
  -y, --yes         Skip the interactive menu; install with the default/flag mode
  --no-login        Skip the headless device login step
  -h, --help        Show this help

You can cancel any time with Ctrl+C — the installer cleans up after itself
and never leaves a half-installed tunnel behind.
EOF
}

prompt_install_mode() {
	local choice=""
	# Only prompt when a human is actually watching.
	[ -t 2 ] || return 0
	[ -r /dev/tty ] || return 0
	printf '\n%sHow would you like to install?%s\n' "$AWT_C_BOLD" "$AWT_C_OFF" >&2
	printf '  %s1)%s Full %s(recommended)%s — complete tunnel with browser support\n' \
		"$AWT_C_CYAN" "$AWT_C_OFF" "$AWT_C_DIM" "$AWT_C_OFF" >&2
	printf '  %s2)%s Minimal — agent + registration, uses your system Node.js\n' \
		"$AWT_C_CYAN" "$AWT_C_OFF" >&2
	printf '  %s3)%s Agent only — fastest, for headless servers\n' \
		"$AWT_C_CYAN" "$AWT_C_OFF" >&2
	printf '%sChoose [1-3] (default 1): %s' "$AWT_C_GOLD" "$AWT_C_OFF" >&2
	if ! IFS= read -r choice </dev/tty; then
		printf '\n' >&2
		return 0
	fi
	case "$choice" in
		2|minimal) AWTSMOOS_INSTALL_MODE="minimal" ;;
		3|agent-only|agentonly) AWTSMOOS_INSTALL_MODE="agent-only" ;;
		*) AWTSMOOS_INSTALL_MODE="full" ;;
	esac
}

parse_installer_args() {
	while [ $# -gt 0 ]; do
		case "$1" in
			--full)            AWTSMOOS_INSTALL_MODE="full" ;;
			--minimal)         AWTSMOOS_INSTALL_MODE="minimal" ;;
			--agent-only|--agentonly) AWTSMOOS_INSTALL_MODE="agent-only" ;;
			--clean)           AWTSMOOS_INSTALL_CLEAN=1 ;;
			--mode=*)          AWTSMOOS_INSTALL_MODE="${1#--mode=}" ;;
			-y|--yes)          AWT_ASSUME_YES=1 ;;
			--no-login)        AWTSMOOS_SKIP_DEVICE_LOGIN=1 ;;
			-h|--help)         print_installer_help; exit 0 ;;
			--)                shift; break ;;
			-*)                awt_warn "Unknown option: $1 (ignored)" ;;
			*)                 break ;;
		esac
		shift
	done
	case "$AWTSMOOS_INSTALL_MODE" in
		""|full|minimal|agent-only) ;;
		*) awt_warn "Unknown mode '$AWTSMOOS_INSTALL_MODE'; using 'full'."; AWTSMOOS_INSTALL_MODE="full" ;;
	esac
}

print_install_plan() {
	local mode="$1"
	awt_dim "Install plan — $mode mode:"
	case "$mode" in
		full)
			awt_dim "  1. Fetch the verified installer"
			awt_dim "  2. Preserve your identity and browser state"
			awt_dim "  3. Install and verify the tunnel agent"
			awt_dim "  4. Register this machine and open the control page"
			;;
		minimal)
			awt_dim "  1. Fetch the verified installer"
			awt_dim "  2. Preserve your identity (uses your system Node.js 18+)"
			awt_dim "  3. Install and verify the tunnel agent"
			awt_dim "  4. Register this machine (control URL printed, not opened)"
			;;
		agent-only)
			awt_dim "  1. Fetch the verified installer"
			awt_dim "  2. Preserve your device identity (uses your system Node.js 18+)"
			awt_dim "  3. Install and verify the tunnel agent"
			awt_dim "  4. Register this machine — headless, nothing else touched"
			awt_dim "  5. Log in with no browser (approve the code on your phone)"
			;;
	esac
	awt_dim "Press Ctrl+C any time to cancel cleanly."
}

select_install_root() {
	local explicit_primary="${AWTSMOOS_PRIMARY_INSTALL_ROOT:-}"
	local inherited="${AWTSMOOS_INSTALL_ROOT:-$canonical_root}"
	if [ -n "$explicit_primary" ]; then printf '%s\n' "$explicit_primary"; return 0; fi
	if [ "${AWTSMOOS_EMERGENCY_MODE:-0}" = "1" ]; then
		awt_warn 'Emergency parent detected; targeting primary root.'
		printf '%s\n' "$canonical_root"
		return 0
	fi
	case "$inherited" in
		"$recovery_hint"/emergency-runtime/*|*/.awtsmoos-tunnel.candidate-*|*/.awtsmoos-tunnel.activation-rollback-*|\
		*/.awtsmoos-tunnel.failed-*|*/.awtsmoos-tunnel.incomplete-*|*/.awtsmoos-tunnel.installer-runtime-*|\
		*/.awtsmoos-tunnel.recovery-displaced-*)
			awt_warn "Transient install root ignored: $inherited"
			printf '%s\n' "$canonical_root"
			;;
		*) printf '%s\n' "$inherited" ;;
	esac
}

clear_emergency_parent_environment() {
	[ "${AWTSMOOS_EMERGENCY_MODE:-0}" = "1" ] || return 0
	unset AWTSMOOS_ACTIVATION_ID AWTSMOOS_COMMAND_MAX_ACTIVE AWTSMOOS_COMMAND_MAX_ACTIVE_PER_OWNER
	unset AWTSMOOS_COMMAND_TIER AWTSMOOS_EMERGENCY_MODE AWTSMOOS_INSTALL_CWD AWTSMOOS_LOCAL_API_PORT
	unset AWTSMOOS_MISSION_BOOT_RESUME AWTSMOOS_PROJECT_ROOT AWTSMOOS_RUNTIME_VERSION
	unset AWTSMOOS_SELF_UPDATE_DISABLED AWTSMOOS_SELF_UPDATE_MODE
}

initial_fetch() {
	local url="$1" destination="$2" label="$3"
	local attempt=1 delay=1 temporary="${destination}.part" error_file="${destination}.error" code_file="${destination}.code" code="" status=0
	while [ "$attempt" -le 3 ]; do
		rm -f "$temporary" "$error_file" "$code_file"
		set +e
		# Run curl in the background so a Ctrl+C trap can kill a hanging fetch at once.
		curl -sS -L --connect-timeout 8 --max-time 45 --speed-time 20 --speed-limit 1024 \
			-o "$temporary" -w '%{http_code}' "$url" >"$code_file" 2>"$error_file" &
		AWT_FETCH_PID=$!
		wait "$AWT_FETCH_PID"
		status=$?
		AWT_FETCH_PID=""
		code="$(cat "$code_file" 2>/dev/null)"
		set -e
		if [ "$status" -eq 0 ] && [[ "$code" == 2?? ]]; then
			mv -f "$temporary" "$destination"; rm -f "$error_file" "$code_file"; return 0
		fi
		awt_warn "retry $label (HTTP=${code:-000}) attempt=$attempt/3 wait=${delay}s"
		rm -f "$temporary" "$error_file" "$code_file"
		[ "$attempt" -eq 3 ] && break
		sleep "$delay"; delay=$((delay * 2)); attempt=$((attempt + 1))
	done
	return 1
}

# --- Graceful Ctrl+C: clean cancel, no leftovers, exit 130 (Yaakov 2026-10-11) ---
AWT_FETCH_PID=""
on_install_interrupt() {
	printf '\n' >&2
	awt_warn 'Cancelled by user (Ctrl+C).'
	[ -n "$AWT_FETCH_PID" ] && kill -INT "$AWT_FETCH_PID" 2>/dev/null
	awt_dim 'Cleaning up the installer workspace…'
	rm -rf "${runtime_root:-}"
	awt_ok 'Cleaned up. Nothing was installed or changed.'
	exit 130
}

awt_banner
parse_installer_args "$@"
if [ -z "$AWTSMOOS_INSTALL_MODE" ] && [ "$AWT_ASSUME_YES" != "1" ]; then
	prompt_install_mode
fi
AWTSMOOS_INSTALL_MODE="${AWTSMOOS_INSTALL_MODE:-full}"
export AWTSMOOS_INSTALL_MODE
export AWTSMOOS_SKIP_DEVICE_LOGIN="${AWTSMOOS_SKIP_DEVICE_LOGIN:-}"
# Yaakov 2026-10-14: --agent-only always starts from a clean slate.
if [ "$AWTSMOOS_INSTALL_MODE" = "agent-only" ]; then
	AWTSMOOS_INSTALL_CLEAN=1
fi
export AWTSMOOS_INSTALL_CLEAN
print_install_plan "$AWTSMOOS_INSTALL_MODE"
awt_intro_box "$AWTSMOOS_INSTALL_MODE"
install_root="$(select_install_root)"
clear_emergency_parent_environment
runtime_root="${install_root}.installer-runtime-$$"
mkdir -p "$(dirname "$install_root")" "$runtime_root"
trap on_install_interrupt INT TERM
if ! command -v curl >/dev/null 2>&1; then
	awt_fail 'curl was not found; it is required to fetch the installer.'
	rm -rf "$runtime_root"; exit 1
fi
export AWTSMOOS_INSTALL_ORIGIN="$origin" AWTSMOOS_INSTALL_ROOT="$install_root" AWTSMOOS_INSTALL_RUNTIME="$runtime_root"
export AWTSMOOS_INSTALLER_COMPONENTS_SHA256="__AWTSMOOS_INSTALLER_COMPONENTS_SHA256__"
fetch_policy="$runtime_root/unix-bootstrap-fetch.sh"
run_script="$runtime_root/unix-bootstrap-run.sh"
awt_step "Waving the magic wand at $origin … ✨"
if ! initial_fetch "$origin/apps/tunnel/downloads/unix-bootstrap-fetch.sh" "$fetch_policy" "bootstrap fetch policy"; then
	rm -rf "$runtime_root"; awt_fail 'Public installer source is temporarily unavailable; working runtime was left untouched.'; exit 1
fi
source "$fetch_policy"
if ! bootstrap_fetch "$origin/api/tunnel/install/unix-bootstrap-run.sh" "$run_script" "bootstrap engine"; then
	rm -rf "$runtime_root"; awt_fail 'Could not fetch bootstrap engine; working runtime was left untouched.'; exit 1
fi
chmod +x "$fetch_policy" "$run_script"
awt_dim '🪄 Handing off to the bootstrap engine — sit back and enjoy the magic! (Ctrl+C any time to cancel cleanly.)'
trap - INT TERM
exec /bin/bash "$run_script"
