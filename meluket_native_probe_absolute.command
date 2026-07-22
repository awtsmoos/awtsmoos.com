#!/bin/zsh
NODE="/Users/awtsmoos/.nvm/versions/node/v24.17.0/bin/node"
SCRIPT="/Users/awtsmoos/meluket_native_probe_min.js"
LOG="/tmp/meluket_native_probe_absolute.log"
DONE="/tmp/meluket_native_probe_absolute.done"
JSON="/tmp/meluket_native_probe_min.json"

{
	echo "MELUKET_NATIVE_ABSOLUTE_V1"
	echo "STARTED=$(/bin/date -u +%Y-%m-%dT%H:%M:%SZ)"
	echo "NODE=$NODE"
	"$NODE" --version
	echo "SCRIPT=$SCRIPT"
	echo "SCRIPT_EXISTS=$([[ -f "$SCRIPT" ]] && echo yes || echo no)"
	echo "SOURCE_EXISTS=$([[ -f '/Users/awtsmoos/Documents/dayuhChadash - Copy/socialPacked/social.core.awtsocial' ]] && echo yes || echo no)"
	echo "RUN_BEGIN"
	"$NODE" "$SCRIPT"
	EXIT_CODE=$?
	echo "RUN_EXIT=$EXIT_CODE"
	echo "JSON_EXISTS=$([[ -f "$JSON" ]] && echo yes || echo no)"
	[[ -f "$JSON" ]] && /bin/ls -l "$JSON"
	echo "FINISHED=$(/bin/date -u +%Y-%m-%dT%H:%M:%SZ)"
	echo "END_MELUKET_NATIVE_ABSOLUTE_V1"
} > "$LOG" 2>&1
printf "%s\n" "${EXIT_CODE:-99}" > "$DONE"
