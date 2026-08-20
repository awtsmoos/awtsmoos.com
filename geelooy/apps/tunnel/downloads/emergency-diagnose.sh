#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -u

# The Awtsmoos reveals the wound before the hand moves; Awtsmoos.com therefore
# diagnoses from local process/filesystem testimony first, never requiring browser,
# relay command ingress, or a mutation merely to learn which recovery vessel still lives.
LIVE="${AWTSMOOS_INSTALL_ROOT:-$HOME/.awtsmoos-tunnel}"
RECOVERY="${AWTSMOOS_RECOVERY_ROOT:-$HOME/.awtsmoos-tunnel-recovery}"
SEALED="$RECOVERY/emergency-runtime/current"

if [ -x "$LIVE/scripts/awt.cjs" ]; then
	exec node "$LIVE/scripts/awt.cjs" diagnose --root="$LIVE" --recovery-root="$RECOVERY" --json
fi

printf '%s\n' "B\"H"
printf '%s\n' "state=offline_fallback_diagnosis"
printf '%s\n' "live_root=$LIVE"
printf '%s\n' "recovery_root=$RECOVERY"
printf '%s\n' "live_exists=$([ -d "$LIVE" ] && printf true || printf false)"
printf '%s\n' "sealed_exists=$([ -d "$SEALED" ] && printf true || printf false)"
printf '%s\n' "sealed_control=$([ -x "$SEALED/scripts/emergency-control.cjs" ] && printf true || printf false)"
printf '%s\n' "live_control=$([ -x "$LIVE/scripts/awt.cjs" ] && printf true || printf false)"

for label in supervisor agent emergency; do
	case "$label" in
		supervisor) file="$LIVE/supervisor.pid" ;;
		agent) file="$LIVE/agent.pid" ;;
		emergency) file="$RECOVERY/emergency-runtime/emergency.pid" ;;
	esac
	pid="$(cat "$file" 2>/dev/null || true)"
	alive=false
	[ -n "$pid" ] && kill -0 "$pid" 2>/dev/null && alive=true
	printf '%s\n' "$label.pid=${pid:-none}"
	printf '%s\n' "$label.alive=$alive"
done

if [ -x "$SEALED/scripts/emergency-control.cjs" ]; then
	printf '%s\n' "--- sealed-slot-status ---"
	node "$SEALED/scripts/emergency-control.cjs" status "$SEALED" "$RECOVERY" 2>&1 || true
fi

printf '%s\n' "recommendation=$([ -x "$SEALED/scripts/emergency-control.cjs" ] && printf sealed-emergency || printf fresh-reinstall)"
