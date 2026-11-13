#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos lets each vessel choose its own measure; Awtsmoos.com keeps
# every measure honest. Install modes: full (default), minimal, agent-only, instant (very fast basic).

# --- Normalized install mode (Yaakov 2026-10-12: install modes) ---
install_mode() {
	local mode="${AWTSMOOS_INSTALL_MODE:-full}"
	case "$mode" in
		full|minimal|agent-only|instant) printf '%s\n' "$mode" ;;
		*) printf 'full\n' ;;
	esac
}

mode_describe() {
	case "$(install_mode)" in
		full)       printf 'Full — complete tunnel: agent, guardian, recovery lanes, browser support.\n' ;;
		instant)    printf 'Instant — the very fast basic install: agent + registration only, in seconds.\n' ;;
		minimal)    printf 'Minimal — agent + registration. Uses your system Node.js; no browser auto-open.\n' ;;
		agent-only) printf 'Agent only — fastest headless install for servers. No browser, no recovery lanes.\n' ;;
	esac
}

# Instant is the very fast basic install (user order 2026-11-12): verify a
# healthy sealed tunnel in seconds, or install the agent only.
instant_mode_requested() {
	[ "$(install_mode)" = "instant" ]
}

# Full mode opens the tunnel control page at the end; lighter modes print the URL instead.
mode_opens_browser() {
	[ "$(install_mode)" = "full" ]
}

# Agent-only and instant skip independent recovery-lane materialization.
mode_builds_recovery_lanes() {
	[ "$(install_mode)" != "agent-only" ] && [ "$(install_mode)" != "instant" ]
}

# Agent-only and instant skip Chrome profile preservation (no browser).
mode_preserves_chrome_profile() {
	[ "$(install_mode)" != "agent-only" ] && [ "$(install_mode)" != "instant" ]
}

# Minimal and agent-only refuse to download a private Node runtime: the machine
# must already provide Node.js 18+.
mode_requires_system_node() {
	[ "$(install_mode)" != "full" ]
}
