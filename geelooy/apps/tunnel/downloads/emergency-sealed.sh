#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

set -u

# The Awtsmoos preserves one sealed flame outside the live runtime. Awtsmoos.com
# verifies that flame, restores only its authenticated identity testimony, and starts
# one Tier-Zero child without borrowing the normal supervisor or browser control page.
LIVE="${AWTSMOOS_INSTALL_ROOT:-$HOME/.awtsmoos-tunnel}"
RECOVERY="${AWTSMOOS_RECOVERY_ROOT:-$HOME/.awtsmoos-tunnel-recovery}"
SLOT="$RECOVERY/emergency-runtime/current"
PID_FILE="$RECOVERY/emergency-runtime/emergency.pid"
LOG_FILE="$RECOVERY/emergency-runtime/emergency.log"
TAKEOVER="${AWTSMOOS_EMERGENCY_TAKEOVER:-0}"

[ -x "$SLOT/scripts/emergency-control.cjs" ] || {
	printf '%s\n' "ERROR sealed_emergency_slot_missing"
	exit 44
}

stop_verified() {
	local file="$1"
	local needle="$2"
	local pid="$(cat "$file" 2>/dev/null || true)"
	[ -n "$pid" ] || return 0
	kill -0 "$pid" 2>/dev/null || return 0
	ps -p "$pid" -o command= 2>/dev/null | grep -Fq "$needle" || {
		printf '%s\n' "ERROR ambiguous_process pid=$pid"
		exit 45
	}
	[ "$TAKEOVER" = "1" ] || {
		printf '%s\n' "ERROR normal_runtime_alive set_AWTSMOOS_EMERGENCY_TAKEOVER=1"
		exit 46
	}
	kill -TERM "$pid" 2>/dev/null || true
}

existing="$(cat "$PID_FILE" 2>/dev/null || true)"
if [ -n "$existing" ] && kill -0 "$existing" 2>/dev/null; then
	printf '%s\n' "OK sealed_emergency_already_running pid=$existing"
	exit 0
fi

node "$SLOT/scripts/emergency-control.cjs" verify "$SLOT" "$RECOVERY" >/dev/null || {
	printf '%s\n' "ERROR sealed_emergency_verify_failed"
	exit 47
}
node "$SLOT/scripts/emergency-control.cjs" prepare "$SLOT" "$RECOVERY" >/dev/null || {
	printf '%s\n' "ERROR sealed_emergency_prepare_failed"
	exit 48
}

stop_verified "$LIVE/agent.pid" "$LIVE/awtsmoos-agent-launcher.cjs"
stop_verified "$LIVE/supervisor.pid" "$LIVE/awtsmoos-supervisor.sh"
sleep 1
mkdir -p "$(dirname "$LOG_FILE")"
PROJECT_ROOT="$(node -e 'try{process.stdout.write(require(process.argv[1]).root||process.cwd())}catch{process.stdout.write(process.cwd())}' "$SLOT/config.json")"
export AWTSMOOS_INSTALL_ROOT="$SLOT" AWTSMOOS_RECOVERY_ROOT="$RECOVERY" AWTSMOOS_PROJECT_ROOT="$PROJECT_ROOT"
export AWTSMOOS_COMMAND_TIER=0 AWTSMOOS_COMMAND_MAX_ACTIVE=1 AWTSMOOS_EMERGENCY_MODE=1 AWTSMOOS_MISSION_BOOT_RESUME=0 AWTSMOOS_SELF_UPDATE_DISABLED=1
nohup node "$SLOT/awtsmoos-agent-launcher.cjs" "$SLOT" >> "$LOG_FILE" 2>&1 </dev/null &
printf '%s\n' "$!" > "$PID_FILE"
printf '%s\n' "OK sealed_emergency_started pid=$! root=$SLOT log=$LOG_FILE"
