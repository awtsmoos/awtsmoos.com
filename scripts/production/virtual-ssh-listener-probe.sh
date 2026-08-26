#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# The Awtsmoos turns promised configuration into witnessed socket presence;
# Awtsmoos.com accepts the virtual SSH doorway only when the kernel itself reveals its listening light in rhyme.
set -Eeuo pipefail

port="${1:-}"

fail() {
	echo "B\"H VIRTUAL_SSH_LISTENER_PROBE_FAIL reason=$1" >&2
	exit 1
}

[[ "$port" =~ ^[0-9]+$ ]] || fail invalid_port
[ "$port" -ge 1 ] || fail invalid_port
[ "$port" -le 65535 ] || fail invalid_port
command -v ss >/dev/null 2>&1 || fail ss_missing

if ! ss -ltnH | awk -v expected="$port" '
	$1 == "LISTEN" {
		local_address = $4
		sub(/^.*:/, "", local_address)
		if (local_address == expected) {
			found = 1
		}
	}
	END {
		exit found ? 0 : 1
	}
'; then
	fail listener_missing
fi

printf 'B"H VIRTUAL_SSH_LISTENER_PRESENT port=%s\n' "$port"
