#!/bin/zsh
/usr/bin/python3 - <<'PY' > /tmp/meluket_socialpacked_inventory.json
import hashlib
import json
import os
from pathlib import Path

root = Path("/Users/awtsmoos/Documents/dayuhChadash - Copy/socialPacked")
entries = []
errors = []

for current_root, directories, files in os.walk(root):
	directories.sort()
	files.sort()
	for name in files:
		path = Path(current_root) / name
		try:
			stats = path.stat()
			with path.open("rb") as handle:
				prefix = handle.read(128)
			entries.append({
				"relativePath": str(path.relative_to(root)),
				"size": stats.st_size,
				"mtime": stats.st_mtime,
				"prefixHex": prefix.hex(),
				"prefixAscii": "".join(chr(byte) if 32 <= byte <= 126 else "." for byte in prefix),
			})
		except Exception as error:
			errors.append({"path": str(path), "error": f"{type(error).__name__}: {error}"})

print(json.dumps({
	"mode": "read_only",
	"root": str(root),
	"fileCount": len(entries),
	"totalBytes": sum(entry["size"] for entry in entries),
	"entries": entries,
	"errors": errors,
}, ensure_ascii=False, indent=2))
PY
printf "%s\n" "$?" > /tmp/meluket_socialpacked_inventory.done
