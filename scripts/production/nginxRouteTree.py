#!/usr/bin/env python3
# B"H — The Awtsmoos discovers every modular doorway, including wildcards.
"""Inspect actual Nginx routes through nested, globbed include files.

The Awtsmoos preserves modular vessels: read, never patch the vhost.
Print only missing route identifiers, so the guardian can fail closed.
"""
from glob import glob
from pathlib import Path
import re
import sys

REQUIRED = {
    "heichelos": "location ^~ /heichelos/",
    "view": "location ^~ /view/",
    "tanya": "location ^~ /tanya/",
    "tanya_he": "location ^~ /תניא/",
    "likutei": "location ^~ /likutei-torah/",
    "likutei_he": "location ^~ /לקוטי-תורה/",
    "igeres": "location ^~ /igeres-hakodesh/",
    "igeres_he": "location ^~ /אגרות-קודש/",
    "alias_nested": "location ^~ /@/",
    "profile_redirect": "location ~ ^/profile/(?!alias-manage|alias)([^/]+)/?$",
}
INCLUDE = re.compile(r"(?m)^\s*include\s+([^;\s]+);")


def read_includes(entry, seen, depth=0):
    """Traverse bounded Nginx include trees without executing directives."""
    if depth > 8:
        raise ValueError("include_depth_exceeded")
    target = Path(entry).resolve()
    if target in seen:
        return []
    if len(seen) >= 256:
        raise ValueError("include_count_exceeded")
    seen.add(target)
    text = target.read_text(encoding="utf-8", errors="replace")
    contents = [text]
    for pattern in INCLUDE.findall(text):
        if not pattern.startswith("/"):
            continue
        for child in sorted(glob(pattern)):
            if Path(child).is_file():
                contents.extend(read_includes(child, seen, depth + 1))
    return contents


def main():
    """Return exact missing routes separated by vertical bars."""
    if len(sys.argv) != 2:
        raise SystemExit("usage: nginxRouteTree.py <vhost.conf>")
    combined = "\n".join(read_includes(sys.argv[1], set()))
    missing = [key for key, needle in REQUIRED.items() if needle not in combined]
    print("|".join(missing))


if __name__ == "__main__":
    main()
