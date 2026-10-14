#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Awtsmoos Tunnel installer presentation (Yaakov 2026-10-12):
# a beautiful CLI — real percentage bars, tasteful color, clear step
# introductions. Degrades to plain text when piped or on dumb terminals.
#
# Round 2 (Yaakov 2026-10-12): dual overall + per-step progress display,
# polished intro screen. install_progress keeps its ABSOLUTE 0-100 semantics;
# install_begin_step declares step ranges so no call-site churn is needed.

INSTALL_PROGRESS_FILE="${AWTSMOOS_INSTALL_PROGRESS_FILE:-${AWTSMOOS_INSTALL_RUNTIME:-/tmp}/install-progress.state}"
INSTALL_PROGRESS_LAST=0
INSTALL_PROGRESS_LINE_OPEN=0

# --- Color detection: always beautiful (Yaakov 2026-10-14) ---
# B"H — Yaakov 2026-10-14: ALWAYS use beautiful colors. The magical experience
# requires colors at every step. Only disable if explicitly requested.
if [ "${NO_COLOR:-}" != "1" ] && [ "${TERM:-}" != "dumb" ]; then
	PRG_C_BOLD=$'\033[1m'; PRG_C_DIM=$'\033[2m'; PRG_C_GOLD=$'\033[1;33m'
	PRG_C_GREEN=$'\033[1;32m'; PRG_C_RED=$'\033[1;31m'; PRG_C_CYAN=$'\033[1;36m'
	PRG_C_MAGENTA=$'\033[1;35m'; PRG_C_OFF=$'\033[0m'
	PRG_TTY=1
else
	PRG_C_BOLD=''; PRG_C_DIM=''; PRG_C_GOLD=''; PRG_C_GREEN=''
	PRG_C_RED=''; PRG_C_CYAN=''; PRG_C_MAGENTA=''; PRG_C_OFF=''
	PRG_TTY=0
fi

# UTF-8 block characters only when the locale can render them; ASCII fallback.
if [ "$PRG_TTY" = "1" ]; then
	case "${LC_ALL:-${LANG:-}}" in
		*UTF-8*|*utf8*|*UTF8*)
			PRG_FILLED='█'; PRG_EMPTY='░'
			PRG_SMOOTH=1
			;;
		*) PRG_FILLED='#'; PRG_EMPTY='-'; PRG_SMOOTH=0 ;;
	esac
else
	PRG_FILLED='#'; PRG_EMPTY='-'; PRG_SMOOTH=0
fi
# Eighth-block glyphs for smooth bar edges (TTY + UTF-8 only).
PRG_PARTS=(' ' '▏' '▎' '▍' '▌' '▋' '▊' '▉')

# --- ETA tracking (Yaakov 2026-10-14): show "~45s left" on progress bars ---
INSTALL_PROGRESS_START=0
_prg_format_eta() {
	local pct="${1:-0}" now start elapsed rate remaining
	case "$pct" in
		''|*[!0-9]*) return 0 ;;
	esac
	[ "$pct" -le 0 ] && return 0
	[ "$pct" -ge 100 ] && return 0
	start="$INSTALL_PROGRESS_START"
	[ "$start" -le 0 ] && return 0
	now="$(date +%s 2>/dev/null || printf '0')"
	[ "$now" -le "$start" ] && return 0
	elapsed=$(( now - start ))
	[ "$elapsed" -le 0 ] && return 0
	rate=$(( pct * 100 / elapsed ))
	[ "$rate" -le 0 ] && return 0
	remaining=$(( (100 - pct) * 100 / rate ))
	if [ "$remaining" -lt 60 ]; then
		printf '~%ds left' "$remaining"
	elif [ "$remaining" -lt 3600 ]; then
		printf '~%dm left' "$(( remaining / 60 ))"
	else
		printf '~%dh left' "$(( remaining / 3600 ))"
	fi
}

# --- Big, friendly step introductions ---
# Usage: install_phase "Setting up your tunnel" "what this phase does"
install_phase() {
	local title="$1" subtitle="${2:-}"
	finish_install_progress_line
	if [ "$PRG_TTY" = "1" ]; then
		printf '\n%s  ✦  %s%s%s\n' "$PRG_C_GOLD" "$PRG_C_BOLD" "$title" "$PRG_C_OFF" >&2
		[ -n "$subtitle" ] && printf '%s     %s%s\n' "$PRG_C_DIM" "$subtitle" "$PRG_C_OFF" >&2
	else
		printf '\n== %s ==\n' "$title" >&2
		[ -n "$subtitle" ] && printf '%s\n' "$subtitle" >&2
	fi
}

# --- Indeterminate spinner (for phases with no percentage) ---
PRG_SPINNER_PID=""
PRG_SPINNER_FRAMES=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')
prg_spinner_start() {
	local message="$1"
	[ "$PRG_TTY" = "1" ] || { printf '%s\n' "$message" >&2; return 0; }
	(
		local i=0
		while :; do
			printf '\r\033[2K%s%s%s %s' "$PRG_C_CYAN" "${PRG_SPINNER_FRAMES[$((i % 10))]}" "$PRG_C_OFF" "$message" >&2
			i=$((i + 1)); sleep 0.1
		done
	) &
	PRG_SPINNER_PID=$!
}
prg_spinner_stop() {
	if [ -n "$PRG_SPINNER_PID" ]; then
		kill "$PRG_SPINNER_PID" 2>/dev/null
		wait "$PRG_SPINNER_PID" 2>/dev/null
		PRG_SPINNER_PID=""
		printf '\r\033[2K' >&2
	fi
}

# --- Progress state (monotonic, persisted) ---
load_install_progress() {
	local stored="0"
	if [ -f "$INSTALL_PROGRESS_FILE" ]; then
		stored="$(cat "$INSTALL_PROGRESS_FILE" 2>/dev/null || printf '0')"
	fi
	case "$stored" in
		''|*[!0-9]*) stored=0 ;;
	esac
	INSTALL_PROGRESS_LAST="$stored"
}

clamp_install_progress() {
	local value="${1:-0}"
	case "$value" in
		''|*[!0-9]*) value=0 ;;
	esac
	[ "$value" -lt 0 ] && value=0
	[ "$value" -gt 100 ] && value=100
	[ "$value" -lt "$INSTALL_PROGRESS_LAST" ] && value="$INSTALL_PROGRESS_LAST"
	printf '%s\n' "$value"
}

render_install_progress() {
	local percent="$1"
	local message="$2"
	local width=30
	local total_eighths=$(( percent * width * 8 / 100 ))
	local filled=$(( total_eighths / 8 )) rest=$(( total_eighths % 8 ))
	local bar="" index
	for (( index=0; index<filled; index+=1 )); do
		bar="${bar}${PRG_FILLED}"
	done
	if [ "$rest" -gt 0 ] && [ "$filled" -lt "$width" ] && [ "$PRG_SMOOTH" = "1" ]; then
		bar="${bar}${PRG_PARTS[$rest]}"
		filled=$(( filled + 1 ))
	fi
	for (( index=filled; index<width; index+=1 )); do
		bar="${bar}${PRG_EMPTY}"
	done
	local eta=""
	eta="$(_prg_format_eta "$percent")"
	[ -n "$eta" ] && eta=" $eta"
	if [ "$PRG_TTY" = "1" ]; then
		local color="$PRG_C_CYAN"
		[ "$percent" -ge 100 ] && color="$PRG_C_GREEN"
		printf '\r\033[2K  %s%3d%%%s %s%s%s%s %s' \
			"$color" "$percent" "$PRG_C_OFF" \
			"$PRG_C_GREEN" "$bar" "$PRG_C_OFF" \
			"$PRG_C_DIM$eta$PRG_C_OFF" \
			"$message" >&2
		INSTALL_PROGRESS_LINE_OPEN=1
	else
		printf '[%3d%%] [%s]%s %s\n' "$percent" "$bar" "$eta" "$message" >&2
		INSTALL_PROGRESS_LINE_OPEN=0
	fi
}

fail_install_progress() {
	finish_install_progress_line
	if [ "$PRG_TTY" = "1" ]; then
		printf '%s✕  FAILED%s  %s\n' "$PRG_C_RED" "$PRG_C_OFF" "${1:-Awtsmoos Tunnel installation failed.}" >&2
	else
		printf '[FAILED] %s\n' "${1:-Awtsmoos Tunnel installation failed.}" >&2
	fi
}

# Pretty one-shot result lines. UTF-8 symbols are used in both TTY and
# non-TTY modes — the TTY check gates live \r redraws, not symbol rendering.
# Yaakov 2026-10-14: every line must be beautiful, even over SSH pipes.
if [ "$PRG_TTY" = "1" ]; then
	prg_ok()   { printf '%s  ✓%s %s\n' "$PRG_C_GREEN" "$PRG_C_OFF" "$1" >&2; }
	prg_warn() { printf '%s  ⚠%s %s\n' "$PRG_C_GOLD" "$PRG_C_OFF" "$1" >&2; }
	prg_info() { printf '%s  ▸%s %s\n' "$PRG_C_CYAN" "$PRG_C_OFF" "$1" >&2; }
else
	prg_ok()   { printf '%s✓%s %s\n' "$PRG_C_GREEN" "$PRG_C_OFF" "$1" >&2; }
	prg_warn() { printf '%s⚠%s %s\n' "$PRG_C_GOLD" "$PRG_C_OFF" "$1" >&2; }
	prg_info() { printf '%s▸%s %s\n' "$PRG_C_CYAN" "$PRG_C_OFF" "$1" >&2; }
fi
prg_dim()  { printf '%s%s%s\n' "$PRG_C_DIM" "$1" "$PRG_C_OFF" >&2; }

# --- Overall + per-step progress (Yaakov 2026-10-12, round 2) ---
# install_progress keeps ABSOLUTE 0-100 semantics (dozens of call sites).
# install_begin_step <n> <total> <title> [subtitle] [range_start] [range_end]
# declares the current step; the per-step bar derives from the absolute
# percentage inside the step's range. No call-site churn required.
INSTALL_STEP_N=0
INSTALL_STEP_TOTAL=0
INSTALL_STEP_TITLE=""
INSTALL_STEP_START=0
INSTALL_STEP_END=100
INSTALL_STEP_PCT=0
INSTALL_OVERALL_PCT=0
PRG_STEP_MSG=""
PRG_DISPLAY_OPEN=0

_prg_make_bar() {
	local pct="${1:-0}" width="${2:-24}"
	case "$pct" in
		''|*[!0-9]*) pct=0 ;;
	esac
	local total_eighths=$(( pct * width * 8 / 100 ))
	local full=$(( total_eighths / 8 )) rest=$(( total_eighths % 8 ))
	local bar="" i
	for (( i=0; i<full; i+=1 )); do bar="${bar}${PRG_FILLED}"; done
	if [ "$rest" -gt 0 ] && [ "$full" -lt "$width" ] && [ "$PRG_SMOOTH" = "1" ]; then
		bar="${bar}${PRG_PARTS[$rest]}"
		full=$(( full + 1 ))
	fi
	for (( i=full; i<width; i+=1 )); do bar="${bar}${PRG_EMPTY}"; done
	printf '%s' "$bar"
}

_prg_recalc_step() {
	local span=$(( INSTALL_STEP_END - INSTALL_STEP_START ))
	if [ "$span" -le 0 ]; then INSTALL_STEP_PCT=100; return 0; fi
	INSTALL_STEP_PCT=$(( (INSTALL_OVERALL_PCT - INSTALL_STEP_START) * 100 / span ))
	[ "$INSTALL_STEP_PCT" -lt 0 ] && INSTALL_STEP_PCT=0
	[ "$INSTALL_STEP_PCT" -gt 100 ] && INSTALL_STEP_PCT=100
	[ "$INSTALL_OVERALL_PCT" -ge 100 ] && INSTALL_STEP_PCT=100
	return 0
}

prg_draw_display() {
	[ "$PRG_TTY" = "1" ] || return 0
	[ "$INSTALL_STEP_TOTAL" -gt 0 ] || return 0
	# B"H — Yaakov 2026-10-14: ONE continuous percentage bar with WAY BETTER
	# ASCII particle effects. Single line, magical, beautiful.
	local pct="$INSTALL_OVERALL_PCT"
	local width=40
	local filled=$(( pct * width / 100 ))
	local empty=$(( width - filled ))
	local bar="" i
	# Build the bar with particle effects (EVEN MORE BEAUTIFUL! SIX-SIDED STARS!)
	for (( i=0; i<filled; i+=1 )); do
		# Random sparkle particles with variety (WAY BETTER! EVEN MORE! SIX-SIDED!)
		if [ $(( RANDOM % 5 )) -eq 0 ] && [ "$i" -gt 0 ]; then
			# Variety of magical particles: ✧ ⋆ ✩ ✶ (six-sided star!)
			case $(( RANDOM % 4 )) in
				0) bar="${bar}${PRG_C_CYAN}✧${PRG_C_OFF}" ;;
				1) bar="${bar}${PRG_C_MAGENTA}⋆${PRG_C_OFF}" ;;
				2) bar="${bar}${PRG_C_BLUE}✩${PRG_C_OFF}" ;;
				3) bar="${bar}${PRG_C_YELLOW:-$PRG_C_GOLD}✶${PRG_C_OFF}" ;;
			esac
		else
			bar="${bar}${PRG_C_GREEN}█${PRG_C_OFF}"
		fi
	done
	# The leading particle (bright star at the frontier! EVEN MORE MAGICAL!)
	if [ "$filled" -lt "$width" ]; then
		bar="${bar}${PRG_C_GOLD}✦${PRG_C_OFF}"
		empty=$(( empty - 1 ))
	fi
	for (( i=0; i<empty; i+=1 )); do
		bar="${bar}${PRG_C_DIM}─${PRG_C_OFF}"
	done
	local eta="$(_prg_format_eta "$pct")"
	[ -n "$eta" ] && eta=" ${PRG_C_DIM}${eta}${PRG_C_OFF}"
	# B"H — Yaakov 2026-10-14: Animated emojis that change as progress goes!
	# More emojis, six-sided stars, magical animation!
	local anim_emoji="🌱"
	if [ "$pct" -ge 100 ]; then anim_emoji="🎉";
	elif [ "$pct" -ge 80 ]; then anim_emoji="🌟";
	elif [ "$pct" -ge 60 ]; then anim_emoji="✨";
	elif [ "$pct" -ge 40 ]; then anim_emoji="🔥";
	elif [ "$pct" -ge 20 ]; then anim_emoji="⚡";
	elif [ "$pct" -ge 1 ]; then anim_emoji="🌿"; fi
	# B"H — Yaakov 2026-10-14: BETTER ANIMATIONS! Spinning magical spinner!
	# The spinner rotates even when percentage is static, showing life!
	: "${PRG_SPINNER_IDX:=0}"
	PRG_SPINNER_IDX=$(( (PRG_SPINNER_IDX + 1) % 10 ))
	local spinner_frames="⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
	local spinner="${spinner_frames:$PRG_SPINNER_IDX:1}"
	# Single continuous line with magical particles, animated emoji, and spinner
	local line="$(printf ' %s%s%s %s%3d%%%s [%s] %s%s%s%s' \
		"$anim_emoji" \
		"${PRG_C_CYAN}${spinner}${PRG_C_OFF}" \
		"$PRG_C_GOLD" "$pct" "$PRG_C_OFF" \
		"$bar" \
		"$PRG_C_DIM" "$PRG_STEP_MSG" "$PRG_C_OFF" \
		"$eta")"
	if [ "$PRG_DISPLAY_OPEN" = "1" ]; then
		printf '\r\033[2K%s\r' "$line" >&2
	else
		printf '%s\r' "$line" >&2
		PRG_DISPLAY_OPEN=1
	fi
}

prg_close_display() {
	if [ "$PRG_DISPLAY_OPEN" = "1" ]; then
		printf '\n' >&2
		PRG_DISPLAY_OPEN=0
	fi
}

# Begin a step: prints the phase header and opens the dual progress display.
install_begin_step() {
	local n="${1:-1}" total="${2:-1}" title="${3:-Working}" subtitle="${4:-}"
	local range_start="${5:-0}" range_end="${6:-100}"
	INSTALL_STEP_N="$n"; INSTALL_STEP_TOTAL="$total"
	INSTALL_STEP_TITLE="$title"
	INSTALL_STEP_START="$range_start"; INSTALL_STEP_END="$range_end"
	PRG_STEP_MSG="$title"
	_prg_recalc_step
	install_phase "$title" "$subtitle"
	prg_draw_display
}

# Mark the current step done and close the display, with an optional ok line.
install_finish_step() {
	INSTALL_STEP_PCT=100
	if [ "$INSTALL_OVERALL_PCT" -lt "$INSTALL_STEP_END" ]; then
		INSTALL_OVERALL_PCT="$INSTALL_STEP_END"
	fi
	prg_draw_display
	prg_close_display
	[ -n "${1:-}" ] && prg_ok "$1"
}

# Absolute 0-100 overall progress (unchanged semantics); redraws both bars.
install_progress() {
	local percent
	local message="${2:-Working...}"
	local temporary="${INSTALL_PROGRESS_FILE}.tmp-$$"
	percent="$(clamp_install_progress "${1:-0}")"
	if [ "$INSTALL_PROGRESS_START" -le 0 ] && [ "$percent" -gt 0 ]; then
		INSTALL_PROGRESS_START="$(date +%s 2>/dev/null || printf '0')"
	fi
	mkdir -p "$(dirname "$INSTALL_PROGRESS_FILE")"
	printf '%s\n' "$percent" > "$temporary"
	mv "$temporary" "$INSTALL_PROGRESS_FILE"
	INSTALL_PROGRESS_LAST="$percent"
	INSTALL_OVERALL_PCT="$percent"
	PRG_STEP_MSG="$message"
	_prg_recalc_step
	if [ "$PRG_TTY" = "1" ] && [ "$INSTALL_STEP_TOTAL" -gt 0 ]; then
		prg_draw_display
	elif [ "$PRG_TTY" = "1" ]; then
		render_install_progress "$percent" "$message"
	else
		local overall_bar step_bar eta
		eta="$(_prg_format_eta "$percent")"
		[ -n "$eta" ] && eta=" [$eta]"
		overall_bar="$(_prg_make_bar "$percent" 20)"
		if [ "$INSTALL_STEP_TOTAL" -gt 0 ]; then
			step_bar="$(_prg_make_bar "$INSTALL_STEP_PCT" 10)"
			printf '[%3d%%] [%s]%s step %s/%s [%s] %3d%% %s\n' \
				"$percent" "$overall_bar" "$eta" "$INSTALL_STEP_N" "$INSTALL_STEP_TOTAL" \
				"$step_bar" "$INSTALL_STEP_PCT" "$message" >&2
		else
			printf '[%3d%%] [%s]%s %s\n' "$percent" "$overall_bar" "$eta" "$message" >&2
		fi
	fi
	INSTALL_PROGRESS_LINE_OPEN=0
}

# Polished intro screen: title box, mode, clean start. TTY-aware.
install_intro() {
	local mode="${1:-full}"
	prg_close_display
	if [ "$PRG_TTY" = "1" ]; then
		printf '\n' >&2
		printf '%s  ╭──────────────────────────────────────────────────╮%s\n' "$PRG_C_GOLD" "$PRG_C_OFF" >&2
		printf '%s  │%s   ✦  %sAWTSMOOS TUNNEL%s  — installer                  %s│%s\n' \
			"$PRG_C_GOLD" "$PRG_C_OFF" "$PRG_C_BOLD" "$PRG_C_OFF" "$PRG_C_GOLD" "$PRG_C_OFF" >&2
		printf '%s  │%s      %ssecure doorway to your machines%s               %s│%s\n' \
			"$PRG_C_GOLD" "$PRG_C_OFF" "$PRG_C_DIM" "$PRG_C_OFF" "$PRG_C_GOLD" "$PRG_C_OFF" >&2
		printf '%s  │%s      Mode: %s%-10s%s · Ctrl+C cancels cleanly        %s│%s\n' \
			"$PRG_C_GOLD" "$PRG_C_OFF" "$PRG_C_CYAN" "$mode" "$PRG_C_OFF" "$PRG_C_GOLD" "$PRG_C_OFF" >&2
		printf '%s  ╰──────────────────────────────────────────────────╯%s\n' "$PRG_C_GOLD" "$PRG_C_OFF" >&2
	else
		printf '\n== AWTSMOOS TUNNEL installer (mode: %s) ==\n' "$mode" >&2
		printf 'Ctrl+C cancels cleanly.\n' >&2
	fi
}

# One-shot lines and events must never collide with the live display.
finish_install_progress_line() {
	prg_spinner_stop
	prg_close_display
	if [ "$INSTALL_PROGRESS_LINE_OPEN" -eq 1 ]; then
		printf '\n' >&2
		INSTALL_PROGRESS_LINE_OPEN=0
	fi
}

load_install_progress
