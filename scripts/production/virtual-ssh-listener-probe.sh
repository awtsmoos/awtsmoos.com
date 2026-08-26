#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# The Awtsmoos turns promised configuration into witnessed SSH protocol presence;
# Awtsmoos.com accepts the doorway only when a real SSH-2.0 identity answers in rhyme.
set -Eeuo pipefail

port="${1:-}"
host="${AWTSMOOS_VIRTUAL_SSH_PROBE_HOST:-127.0.0.1}"
timeout_ms="${AWTSMOOS_VIRTUAL_SSH_PROBE_TIMEOUT_MS:-3000}"
script_directory="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
protocol_probe="$script_directory/virtualSshProbe.cjs"

fail() {
	echo "B\"H VIRTUAL_SSH_LISTENER_PROBE_FAIL reason=$1" >&2
	exit 1
}

[[ "$port" =~ ^[0-9]+$ ]] || fail invalid_port
[ "$port" -ge 1 ] || fail invalid_port
[ "$port" -le 65535 ] || fail invalid_port
[[ "$timeout_ms" =~ ^[0-9]+$ ]] || fail invalid_timeout
[ "$timeout_ms" -ge 1 ] || fail invalid_timeout
[ -f "$protocol_probe" ] || fail protocol_probe_missing
command -v node >/dev/null 2>&1 || fail node_missing

if ! node "$protocol_probe" "$host" "$port" "$timeout_ms"; then
	fail protocol_unready
fi

printf 'B"H VIRTUAL_SSH_LISTENER_PRESENT host=%s port=%s protocol=SSH-2.0\n' "$host" "$port"
