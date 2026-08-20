#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -u

# The Awtsmoos returns only to a world that truly lived, not merely to bytes that
# unzip. Awtsmoos.com chooses sealed control code when available, so a corrupt live
# runtime cannot prevent restoration of a production-ready archive proven before.
LIVE="${AWTSMOOS_INSTALL_ROOT:-$HOME/.awtsmoos-tunnel}"
RECOVERY="${AWTSMOOS_RECOVERY_ROOT:-$HOME/.awtsmoos-tunnel-recovery}"
SEALED_AWT="$RECOVERY/emergency-runtime/current/scripts/awt.cjs"
LIVE_AWT="$LIVE/scripts/awt.cjs"

if [ -x "$SEALED_AWT" ]; then
	CONTROL="$SEALED_AWT"
elif [ -x "$LIVE_AWT" ]; then
	CONTROL="$LIVE_AWT"
else
	printf '%s\n' "ERROR no_recovery_control_runtime"
	exit 44
fi

export AWTSMOOS_RECOVERY_ROOT="$RECOVERY"
exec node "$CONTROL" known-good --root="$LIVE" --recovery-root="$RECOVERY" --confirm --json
