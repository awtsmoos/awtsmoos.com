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
import re

path = Path(sys.argv[1])
text = path.read_text()
required = (
    ("/heichelos/", "\tlocation ^~ /heichelos/ {\n\t\tproxy_pass http://127.0.0.1:8080;\n\t}\n"),
    ("/view/", "\tlocation ^~ /view/ {\n\t\tproxy_pass http://127.0.0.1:8080;\n\t}\n"),
    # B"H — human-friendly sefer IDs: geelooy/<sefer>/_awtsmoos.derech.js
    # resolves /tanya, /תניא, ... server-side. Without these, nginx serves
    # the mount dirs statically and the friendly routes never reach Node.
    # (Bare /tanya still 301s to /tanya/ via static dir handling, as /heichelos does.)
    ("/tanya/", "\tlocation ^~ /tanya/ {\n\t\tproxy_pass http://127.0.0.1:8080;\n\t}\n"),
    ("/תניא/", "\tlocation ^~ /תניא/ {\n\t\tproxy_pass http://127.0.0.1:8080;\n\t}\n"),
    ("/likutei-torah/", "\tlocation ^~ /likutei-torah/ {\n\t\tproxy_pass http://127.0.0.1:8080;\n\t}\n"),
    ("/לקוטי-תורה/", "\tlocation ^~ /לקוטי-תורה/ {\n\t\tproxy_pass http://127.0.0.1:8080;\n\t}\n"),
    ("/igeres-hakodesh/", "\tlocation ^~ /igeres-hakodesh/ {\n\t\tproxy_pass http://127.0.0.1:8080;\n\t}\n"),
    ("/אגרות-קודש/", "\tlocation ^~ /אגרות-קודש/ {\n\t\tproxy_pass http://127.0.0.1:8080;\n\t}\n"),
)
# B"H — modular Nginx vhosts place the authoritative location blocks inside
# explicitly included snippet files. Read and validate those includes before
# considering any mutation of the root vhost. Never flatten or overwrite a
# modular configuration owned by another deployment system.
includes = re.findall(r"(?m)^\s*include\s+([^;\s]+);", text)
snippets = []
for include in includes:
    if "*" in include:
        continue  # No glob expansion through an untrusted configuration.
    snippet = Path(include)
    if snippet.is_file():
        snippets.append(snippet.read_text())
combined = text + "\n" + "\n".join(snippets)
missing = [(route, block) for route, block in required if f"location ^~ {route}" not in combined]
if not missing:
    raise SystemExit(0)
marker = "\n\tlocation / {"
if marker not in text:
    raise SystemExit("modular_dynamic_routes_missing:" + ",".join(route for route, _ in missing))
insert = "\n" + "\n".join(block.rstrip("\n") for _, block in missing) + "\n"
path.write_text(text.replace(marker, insert + marker, 1))
PY

if [ "$test_only" = "1" ]; then
	echo "B\"H DYNAMIC_ROUTES_TESTED config=$config"
	exit 0
fi

nginx -t
systemctl reload nginx
printf 'B"H DYNAMIC_ROUTES_READY config=%s\n' "$config"
