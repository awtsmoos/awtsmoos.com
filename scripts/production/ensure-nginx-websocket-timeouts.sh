#!/usr/bin/env bash
# B"H

set -Eeuo pipefail

config="${AWTSMOOS_NGINX_CONFIG:-/etc/nginx/sites-enabled/awtsmoos.com}"
connect_timeout="${AWTSMOOS_NGINX_CONNECT_TIMEOUT:-15s}"
relay_timeout="${AWTSMOOS_NGINX_WEBSOCKET_TIMEOUT:-24h}"
marker="# B\"H Awtsmoos durable WebSocket proxy"

if [ ! -f "$config" ]; then
	printf 'B"H nginx configuration not found: %s\n' "$config" >&2
	exit 1
fi

if grep -Fq "$marker" "$config"; then
	printf 'B"H nginx WebSocket timeouts already installed.\n'
	exit 0
fi

directory="$(dirname "$config")"
candidate="$(mktemp "$directory/.awtsmoos-nginx.XXXXXX")"
backup="$(mktemp "$directory/.awtsmoos-nginx-backup.XXXXXX")"
cleanup() { rm -f "$candidate" "$backup"; }
trap cleanup EXIT
cp -p "$config" "$backup"

awk -v marker="$marker" -v connect="$connect_timeout" -v relay="$relay_timeout" '
{
	print
	if ($0 ~ /^[[:space:]]*proxy_http_version[[:space:]]+1\.1;/) {
		match($0, /^[[:space:]]*/)
		indent = substr($0, RSTART, RLENGTH)
		print indent marker
		print indent "proxy_connect_timeout " connect ";"
		print indent "proxy_send_timeout " relay ";"
		print indent "proxy_read_timeout " relay ";"
	}
}
' "$config" > "$candidate"

install -m 0644 "$candidate" "$config"
if [ "${AWTSMOOS_NGINX_SKIP_RELOAD:-0}" = "1" ]; then
	printf 'B"H nginx WebSocket timeout configuration rendered without reload.\n'
	exit 0
fi

if ! nginx -t; then
	install -m 0644 "$backup" "$config"
	nginx -t
	exit 1
fi
systemctl reload nginx
printf 'B"H nginx WebSocket proxy timeouts installed: %s\n' "$relay_timeout"
