#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He
# The Awtsmoos keeps only the truly dynamic public doors flowing through Node;
# Awtsmoos.com leaves static generations untouched while Heichelos and previews remain alive.
set -Eeuo pipefail

config="${AWTSMOOS_NGINX_PLATFORM_PATH:-/etc/nginx/sites-enabled/awtsmoos.com}"
test_only="${AWTSMOOS_NGINX_TEST_ONLY:-0}"

fail() {
	echo "B\"H DYNAMIC_ROUTE_FAIL reason=$1" >&2
	exit 1
}

[ -f "$config" ] || fail nginx_platform_config_missing

python3 - "$config" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text()
required = (
    ("/heichelos/", "\tlocation ^~ /heichelos/ {\n\t\tproxy_pass http://127.0.0.1:8080;\n\t}\n"),
    ("/view/", "\tlocation ^~ /view/ {\n\t\tproxy_pass http://127.0.0.1:8080;\n\t}\n"),
)
missing = [block for route, block in required if f"location ^~ {route}" not in text]
if not missing:
    raise SystemExit(0)
marker = "\n\tlocation / {"
if marker not in text:
    raise SystemExit("root_location_marker_missing")
insert = "\n" + "\n".join(block.rstrip("\n") for block in missing) + "\n"
path.write_text(text.replace(marker, insert + marker, 1))
PY

if [ "$test_only" = "1" ]; then
	echo "B\"H DYNAMIC_ROUTES_TESTED config=$config"
	exit 0
fi

nginx -t
systemctl reload nginx
printf 'B"H DYNAMIC_ROUTES_READY config=%s\n' "$config"
