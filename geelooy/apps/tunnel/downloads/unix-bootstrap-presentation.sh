#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos gives the earliest installer moment warmth and light;
# Awtsmoos.com presents truthful mode, progress, and cancellation right.

if [ "${NO_COLOR:-}" != "1" ] && [ "${TERM:-}" != "dumb" ]; then
	BST_C_GOLD=$'\033[1;33m'; BST_C_GREEN=$'\033[1;32m'; BST_C_RED=$'\033[1;31m'
	BST_C_CYAN=$'\033[1;36m'; BST_C_DIM=$'\033[2m'; BST_C_OFF=$'\033[0m'
	BST_C_PINK=$'\033[1;95m'; BST_C_YELLOW=$'\033[1;93m'; BST_C_PURPLE=$'\033[38;5;141m'
	BST_COLORFUL=1
else
	BST_C_GOLD=''; BST_C_GREEN=''; BST_C_RED=''; BST_C_CYAN=''; BST_C_DIM=''; BST_C_OFF=''
	BST_C_PINK=''; BST_C_YELLOW=''; BST_C_PURPLE=''
	BST_COLORFUL=0
fi

bst_ok() {
	printf '%s✨%s %s\n' "$BST_C_GREEN" "$BST_C_OFF" "$1" >&2
}

bst_fail() {
	printf '%s💥%s %s\n' "$BST_C_RED" "$BST_C_OFF" "$1" >&2
}

bst_party() {
	printf '%s🎉%s %s\n' "$BST_C_YELLOW" "$BST_C_OFF" "$1" >&2
}

on_bootstrap_interrupt() {
	bootstrap_cancelled=1
	printf '\n%s✕ Cancelled by user (Ctrl+C).%s Cleaning up…\n' "$BST_C_GOLD" "$BST_C_OFF" >&2
	jobs -p 2>/dev/null | xargs -r kill 2>/dev/null || true
	[ "$custody_delegated" = "1" ] || rm -rf -- "$runtime_root"
	printf '%sInstaller cancelled before verified readiness.%s\n' "$BST_C_DIM" "$BST_C_OFF" >&2
	exit 130
}

normalize_bootstrap_mode() {
	AWT_INSTALL_MODE="${AWTSMOOS_INSTALL_MODE:-full}"
	case "$AWT_INSTALL_MODE" in
		full|minimal|agent-only|instant) ;;
		*) AWT_INSTALL_MODE="full" ;;
	esac
	export AWTSMOOS_INSTALL_MODE="$AWT_INSTALL_MODE"
	[ "$AWT_INSTALL_MODE" != full ] || return 0
	printf '%sInstall mode: %s%s\n' "$BST_C_GOLD" "$AWT_INSTALL_MODE" "$BST_C_OFF" >&2
	if ! command -v node >/dev/null 2>&1 ||
		! node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 18 ? 0 : 1)' >/dev/null 2>&1; then
		bst_fail "The '$AWT_INSTALL_MODE' mode needs system Node.js 18+."
		printf 'Install Node.js 18+ or use --full for bundled-runtime support.\n' >&2
		return 1
	fi
	printf '%sSystem Node.js 18+ verified.%s\n' "$BST_C_DIM" "$BST_C_OFF" >&2
}

bootstrap_progress() {
	local percent="$1" message="$2" symbol="🚀"
	printf '%s\n' "$percent" > "$progress_file"
	case "$percent" in
		0) symbol="🌱" ;;
		[1-9]|1[0-9]) symbol="🌿" ;;
		2[0-9]|3[0-9]) symbol="⚡" ;;
		4[0-9]|5[0-9]) symbol="🔥" ;;
		6[0-9]|7[0-9]) symbol="✨" ;;
		8[0-9]|9[0-9]) symbol="🌟" ;;
		100) symbol="🎉" ;;
	esac
	if [ "${AWTSMOOS_PROGRESS_MODE:-tty}" = plain ]; then
		printf '%s[%3d%%]%s %s %s\n' "$BST_C_CYAN" "$percent" "$BST_C_OFF" "$symbol" "$message"
	else
		printf '\r%s\033[2K[%3d%%]%s %s %s' "$BST_C_CYAN" "$percent" "$BST_C_OFF" "$symbol" "$message"
	fi
}

cleanup_bootstrap() {
	local exit_code=$?
	if [ "$bootstrap_cancelled" = "1" ]; then exit 130; fi
	if [ "$exit_code" -ne 0 ]; then
		[ ! -t 1 ] || [ "${AWTSMOOS_PROGRESS_MODE:-tty}" = plain ] || printf '\n'
		bst_fail 'Installer stopped before verified readiness; predecessor was not replaced.'
	fi
	[ "$custody_delegated" = "1" ] || rm -rf -- "$runtime_root"
	exit "$exit_code"
}
