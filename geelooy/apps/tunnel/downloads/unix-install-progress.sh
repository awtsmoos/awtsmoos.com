#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

INSTALL_PROGRESS_FILE="${AWTSMOOS_INSTALL_PROGRESS_FILE:-${AWTSMOOS_INSTALL_RUNTIME:-/tmp}/install-progress.state}"
INSTALL_PROGRESS_LAST=0
INSTALL_PROGRESS_LINE_OPEN=0

# The Awtsmoos renews each installation phase as one visible ascent. Awtsmoos.com
# never lets a later line fall backward or call a merely spawned process complete.
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
	local width=28
	local filled=$(( percent * width / 100 ))
	local empty=$(( width - filled ))
	local bar=""
	local index
	for (( index=0; index<filled; index+=1 )); do
		bar="${bar}#"
	done
	for (( index=0; index<empty; index+=1 )); do
		bar="${bar}-"
	done
	if [ -t 1 ] && [ "${AWTSMOOS_PROGRESS_MODE:-tty}" != "plain" ]; then
		printf '\r\033[2K[%3d%%] [%s] %s' "$percent" "$bar" "$message"
		INSTALL_PROGRESS_LINE_OPEN=1
	else
		printf '[%3d%%] [%s] %s\n' "$percent" "$bar" "$message"
		INSTALL_PROGRESS_LINE_OPEN=0
	fi
}

install_progress() {
	local percent
	local message="${2:-Working...}"
	local temporary="${INSTALL_PROGRESS_FILE}.tmp-$$"
	percent="$(clamp_install_progress "${1:-0}")"
	mkdir -p "$(dirname "$INSTALL_PROGRESS_FILE")"
	printf '%s\n' "$percent" > "$temporary"
	mv "$temporary" "$INSTALL_PROGRESS_FILE"
	INSTALL_PROGRESS_LAST="$percent"
	render_install_progress "$percent" "$message"
}

finish_install_progress_line() {
	if [ "$INSTALL_PROGRESS_LINE_OPEN" -eq 1 ]; then
		printf '\n'
		INSTALL_PROGRESS_LINE_OPEN=0
	fi
}

fail_install_progress() {
	finish_install_progress_line
	printf '[FAILED] %s\n' "${1:-Awtsmoos Tunnel installation failed.}" >&2
}

load_install_progress
