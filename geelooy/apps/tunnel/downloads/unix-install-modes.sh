#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos lets each vessel choose its own measure; Awtsmoos.com keeps
# every measure honest. Install modes: full (default), minimal, agent-only.

# --- Normalized install mode (Yaakov 2026-10-12: install modes) ---
install_mode() {
	local mode="${AWTSMOOS_INSTALL_MODE:-full}"
	case "$mode" in
		full|minimal|agent-only) printf '%s\n' "$mode" ;;
		*) printf 'full\n' ;;
	esac
}

mode_describe() {
	case "$(install_mode)" in
		full)       printf 'Full — complete tunnel: agent, guardian, recovery lanes, browser support.\n' ;;
		minimal)    printf 'Minimal — agent + registration. Uses your system Node.js; no browser auto-open.\n' ;;
		agent-only) printf 'Agent only — fastest headless install for servers. No browser, no recovery lanes.\n' ;;
	esac
}

# Full mode opens the tunnel control page at the end; lighter modes print the URL instead.
mode_opens_browser() {
	[ "$(install_mode)" = "full" ]
}

# Agent-only skips independent recovery-lane materialization (headless servers).
mode_builds_recovery_lanes() {
	[ "$(install_mode)" != "agent-only" ]
}

# Agent-only skips Chrome profile preservation (no browser on a headless box).
mode_preserves_chrome_profile() {
	[ "$(install_mode)" != "agent-only" ]
}

# Minimal and agent-only refuse to download a private Node runtime: the machine
# must already provide Node.js 18+.
mode_requires_system_node() {
	[ "$(install_mode)" != "full" ]
}
