#!/bin/zsh
/usr/bin/python3 - <<'PY' > /tmp/meluket_old_dayuh_218_shape.json
import collections
import json
import os
import re
from pathlib import Path

root = Path("/Users/awtsmoos/Documents/awtsmoos/dayuhChadash")
posts = root / "social/heichelos/ikar/posts"
verify = Path("/Users/awtsmoos/awtsmoos.com/ai_thoughts/20260721-corpus-integrity-talmud-tanach-chassidus-rag/meluket-post-verification.json")
verification = json.loads(verify.read_text())
strings = []

def collect(value):
	if isinstance(value, str):
		strings.append(value)
	elif isinstance(value, list):
		for item in value:
			collect(item)
	elif isinstance(value, dict):
		for key, item in value.items():
			collect(key)
			collect(item)

collect(verification)
ids = sorted({
	match.group(0)
	for value in strings
	for match in re.finditer(r"BH_POST_[A-Za-z0-9_-]+", value)
	if "_theRebbe_" in match.group(0)
})

rows = []
child_pattern_counts = collections.Counter()
existing = []
missing = []
errors = []

for post_id in ids:
	candidates = [
		posts / post_id,
		posts / f"{post_id}.awtsmoosJSON",
		posts / "full" / post_id,
		posts / "full" / f"{post_id}.awtsmoosJSON",
	]
	path = next((candidate for candidate in candidates if candidate.exists()), None)
	if path is None:
		missing.append(post_id)
		continue
	row = {
		"id": post_id,
		"path": str(path),
		"isFile": path.is_file(),
		"isDirectory": path.is_dir(),
	}
	try:
		stats = path.stat()
		row["size"] = stats.st_size
		row["mtime"] = stats.st_mtime
		if path.is_dir():
			children = []
			for child in sorted(path.iterdir()):
				child_stats = child.stat()
				children.append({
					"name": child.name,
					"isFile": child.is_file(),
					"isDirectory": child.is_dir(),
					"size": child_stats.st_size,
				})
			pattern = tuple(item["name"] for item in children)
			child_pattern_counts[pattern] += 1
			row["children"] = children
		elif path.is_file():
			data = path.read_bytes()
			row["prefixHex"] = data[:128].hex()
			row["prefixAscii"] = "".join(chr(byte) if 32 <= byte <= 126 else "." for byte in data[:128])
	except Exception as error:
		row["error"] = f"{type(error).__name__}: {error}"
		errors.append({"id": post_id, "error": row["error"]})
	existing.append(post_id)
	rows.append(row)

patterns = [
	{"count": count, "children": list(pattern)}
	for pattern, count in child_pattern_counts.most_common(50)
]

print(json.dumps({
	"mode": "read_only",
	"root": str(root),
	"posts": str(posts),
	"expectedCount": len(ids),
	"existingCount": len(existing),
	"missingCount": len(missing),
	"fileCount": sum(row["isFile"] for row in rows),
	"directoryCount": sum(row["isDirectory"] for row in rows),
	"errorCount": len(errors),
	"patterns": patterns,
	"rows": rows,
	"missingIds": missing,
	"errors": errors,
}, ensure_ascii=False, indent=2))
PY
printf "%s\n" "$?" > /tmp/meluket_old_dayuh_218_shape.done
