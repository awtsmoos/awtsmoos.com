#!/bin/zsh
/usr/bin/python3 - <<'PY' > /tmp/meluket_old_dayuh_probe.json
import hashlib
import json
import os
from pathlib import Path

root = Path("/Users/awtsmoos/Documents/awtsmoos/dayuhChadash")
ids = [
	"BH_POST_1749792440863_theRebbe_116",
	"BH_POST_1766518919556_theRebbe_605",
	"BH_POST_1766518920368_theRebbe_469",
]

result = {
	"mode": "read_only",
	"root": str(root),
	"rootExists": root.exists(),
	"entities": [],
	"postsDirectory": {},
}

posts = root / "social/heichelos/ikar/posts"
result["postsDirectory"]["path"] = str(posts)
result["postsDirectory"]["exists"] = posts.exists()

if posts.exists():
	try:
		stats = posts.stat()
		result["postsDirectory"].update({
			"isDirectory": posts.is_dir(),
			"size": stats.st_size,
			"mtime": stats.st_mtime,
		})
	except Exception as error:
		result["postsDirectory"]["error"] = f"{type(error).__name__}: {error}"

for post_id in ids:
	candidates = [
		posts / post_id,
		posts / f"{post_id}.awtsmoosJSON",
		posts / "full" / post_id,
		posts / "full" / f"{post_id}.awtsmoosJSON",
	]
	row = {"id": post_id, "candidates": []}
	for path in candidates:
		item = {"path": str(path), "exists": path.exists()}
		if path.exists():
			try:
				stats = path.stat()
				item.update({
					"isFile": path.is_file(),
					"isDirectory": path.is_dir(),
					"size": stats.st_size,
					"mtime": stats.st_mtime,
				})
				if path.is_file():
					data = path.read_bytes()
					item["sha256"] = hashlib.sha256(data).hexdigest()
					item["prefixHex"] = data[:256].hex()
					item["prefixAscii"] = "".join(chr(byte) if 32 <= byte <= 126 else "." for byte in data[:256])
					try:
						payload = json.loads(data)
						item["jsonType"] = type(payload).__name__
						if isinstance(payload, dict):
							item["fields"] = sorted(payload.keys())
							item["payloadId"] = payload.get("id") or payload.get("postId")
							item["author"] = payload.get("author") or payload.get("aliasId")
							item["title"] = payload.get("title") or payload.get("name")
							content = payload.get("content")
							item["contentType"] = type(content).__name__
							item["contentLength"] = len(content) if hasattr(content, "__len__") else None
							item["contentSample"] = content[:500] if isinstance(content, str) else None
					except Exception as error:
						item["jsonError"] = f"{type(error).__name__}: {error}"
				elif path.is_dir():
					children = []
					for child in sorted(path.iterdir()):
						try:
							child_stats = child.stat()
							children.append({
								"name": child.name,
								"isFile": child.is_file(),
								"isDirectory": child.is_dir(),
								"size": child_stats.st_size,
							})
						except Exception as error:
							children.append({"name": child.name, "error": str(error)})
					item["children"] = children[:100]
			except Exception as error:
				item["error"] = f"{type(error).__name__}: {error}"
		row["candidates"].append(item)
	result["entities"].append(row)

print(json.dumps(result, ensure_ascii=False, indent=2))
PY
printf "%s\n" "$?" > /tmp/meluket_old_dayuh_probe.done
