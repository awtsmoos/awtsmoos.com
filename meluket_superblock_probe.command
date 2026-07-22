#!/bin/zsh
/usr/bin/python3 - <<'PY' > /tmp/meluket_superblock_probe.json
import hashlib
import json
import struct
from pathlib import Path

source = Path("/Users/awtsmoos/Documents/dayuhChadash - Copy/socialPacked/social.core.awtsocial")
raw = source.read_bytes()
header = raw[:64]
fields = {}
for offset in range(0, 64, 8):
	fields[str(offset)] = {
		"be_u64": int.from_bytes(header[offset:offset + 8], "big"),
		"le_u64": int.from_bytes(header[offset:offset + 8], "little"),
		"hex": header[offset:offset + 8].hex(),
	}

print(json.dumps({
	"mode": "read_only",
	"source": str(source),
	"size": len(raw),
	"sha256": hashlib.sha256(raw).hexdigest(),
	"header_hex": header.hex(),
	"header_ascii": "".join(chr(byte) if 32 <= byte <= 126 else "." for byte in header),
	"fields": fields,
	"legacy_root_offset": int.from_bytes(header[8:16], "big"),
	"legacy_root_length": int.from_bytes(header[16:24], "big"),
	"legacy_root_inside_file": int.from_bytes(header[8:16], "big") + int.from_bytes(header[16:24], "big") <= len(raw),
}, indent=2))
PY
printf "%s\n" "$?" > /tmp/meluket_superblock_probe.done
