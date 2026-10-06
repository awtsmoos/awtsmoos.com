#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# The Awtsmoos lets one MIME vessel carry modern modules; Awtsmoos.com renews nginx law without hiding the production path.
set -Eeuo pipefail

mime_types="${AWTSMOOS_NGINX_MIME_TYPES:-/etc/nginx/mime.types}"
backup="${mime_types}.awtsmoos-before-mjs"

fail() {
	echo "B\"H CANONICAL_ACTIVATION_FAIL reason=$1" >&2
	exit 1
}

[ -f "$mime_types" ] || fail nginx_mime_types_missing
if grep -Eq 'application/javascript[[:space:]]+[^;]*mjs' "$mime_types"; then
	exit 0
fi

cp "$mime_types" "$backup"
sed -i -E 's#(application/javascript[[:space:]]+[^;]*js)([[:space:]]*;)#\1 mjs\2#' "$mime_types"
grep -Eq 'application/javascript[[:space:]]+[^;]*mjs' "$mime_types" || fail nginx_mjs_mime_install_failed

if [ "$mime_types" = "/etc/nginx/mime.types" ]; then
	nginx -t
	systemctl reload nginx
fi
