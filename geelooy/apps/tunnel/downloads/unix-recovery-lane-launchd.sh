#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos lets launchd guard recovery without entering the primary service family.
# Awtsmoos.com gives every bounded lane a separate label whose life survives primary repair.

recovery_lane_plist_path() {
	printf '%s/Library/LaunchAgents/%s.plist\n' "$HOME" "$(recovery_lane_label "$1")"
}

legacy_recovery_lane_plist_path() {
	printf '%s/Library/LaunchAgents/%s.plist\n' "$HOME" "$(legacy_recovery_lane_label "$1")"
}

stop_launchd_recovery_label() {
	local label="$1"
	local plist="$2"
	if command -v launchctl >/dev/null 2>&1 && [ -n "${HOME:-}" ]; then
		launchctl bootout "$(launchd_domain)/$label" >/dev/null 2>&1 || true
	fi
	rm -f "$plist"
}

stop_launchd_recovery_lane() {
	local lane="$1"
	stop_launchd_recovery_label \
		"$(recovery_lane_label "$lane")" \
		"$(recovery_lane_plist_path "$lane")"
	stop_launchd_recovery_label \
		"$(legacy_recovery_lane_label "$lane")" \
		"$(legacy_recovery_lane_plist_path "$lane")"
}

stop_launchd_recovery_lanes() {
	local pair="" lane=""
	while IFS= read -r pair; do
		[ -n "$pair" ] || continue
		lane="${pair%%:*}"
		stop_launchd_recovery_lane "$lane"
	done <<EOF
$(recovery_lane_pairs)
EOF
}

install_launchd_recovery_lane() {
	local lane="$1"
	local relative="$2"
	local label="$(recovery_lane_label "$lane")"
	local plist="$(recovery_lane_plist_path "$lane")"
	local entry="$ROOT/$relative"
	local path_value="$(dirname "$AWTSMOOS_NODE_BIN"):${PATH:-/usr/local/bin:/usr/bin:/bin}"
	[ -f "$entry" ] || return 1
	mkdir -p "$(dirname "$plist")"
	stop_launchd_recovery_lane "$lane"
	"$AWTSMOOS_NODE_BIN" "$AWTSMOOS_INSTALL_RUNTIME/unix-recovery-lane-plist.cjs" \
		"$plist" "$label" "$AWTSMOOS_NODE_BIN" "$entry" "$ROOT" "$RECOVERY_ROOT" \
		"$path_value" "$RECOVERY_ROOT/logs/$lane.out.log" "$RECOVERY_ROOT/logs/$lane.err.log" || return 1
	launchctl bootstrap "$(launchd_domain)" "$plist" >/dev/null 2>&1 || return 1
	launchctl kickstart -k "$(launchd_domain)/$label" >/dev/null 2>&1 || true
	launchctl print "$(launchd_domain)/$label" >/dev/null 2>&1
}

install_launchd_recovery_lanes() {
	local pair="" lane="" relative="" failed=0
	while IFS= read -r pair; do
		[ -n "$pair" ] || continue
		lane="${pair%%:*}"
		relative="${pair#*:}"
		install_launchd_recovery_lane "$lane" "$relative" || failed=1
	done <<EOF
$(recovery_lane_pairs)
EOF
	[ "$failed" -eq 0 ]
}
