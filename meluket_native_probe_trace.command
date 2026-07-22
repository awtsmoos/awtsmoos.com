#!/bin/zsh
TRACE="/tmp/meluket_native_probe_trace.txt"
DONE="/tmp/meluket_native_probe_trace.done"
JSON="/tmp/meluket_native_probe_min.json"

{
	echo "MELUKET_NATIVE_PROBE_TRACE_V1"
	echo "STARTED_AT=$(/bin/date -u +%Y-%m-%dT%H:%M:%SZ)"
	echo "PWD=$PWD"
	echo "PATH=$PATH"
	echo "NODE_COMMAND=$(command -v node 2>/dev/null || true)"
	/usr/bin/env node --version 2>&1 || true
	echo "SCRIPT_EXISTS=$([[ -f /Users/awtsmoos/meluket_native_probe_min.js ]] && echo yes || echo no)"
	echo "SOURCE_EXISTS=$([[ -f '/Users/awtsmoos/Documents/dayuhChadash - Copy/socialPacked/social.core.awtsocial' ]] && echo yes || echo no)"
	echo "NODE_BEGIN"
	/usr/bin/env node /Users/awtsmoos/meluket_native_probe_min.js 2>&1
	NODE_EXIT=$?
	echo "NODE_EXIT=$NODE_EXIT"
	echo "JSON_EXISTS=$([[ -f "$JSON" ]] && echo yes || echo no)"
	if [[ -f "$JSON" ]]; then
		/bin/ls -l "$JSON"
	fi
	echo "FINISHED_AT=$(/bin/date -u +%Y-%m-%dT%H:%M:%SZ)"
	echo "END_MELUKET_NATIVE_PROBE_TRACE_V1"
} > "$TRACE" 2>&1
printf "%s\n" "${NODE_EXIT:-99}" > "$DONE"
