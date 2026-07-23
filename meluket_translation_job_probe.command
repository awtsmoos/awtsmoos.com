#!/bin/zsh
/usr/bin/python3 - <<'PY' > /tmp/meluket_translation_job_probe.json
import collections
import json
import os
import re
from pathlib import Path

root = Path("/Users/awtsmoos/Documents/awtsmoos-jobs/meluket-translation-job")
chunk_root = root / "generated/meluket-swarm/chunks"
post_pattern = re.compile(r"(BH_POST_[A-Za-z0-9_-]+_theRebbe_[A-Za-z0-9_-]+)")

result = {
	"mode": "read_only",
	"root": str(root),
	"rootExists": root.exists(),
	"chunkRoot": str(chunk_root),
	"chunkRootExists": chunk_root.exists(),
	"topLevel": [],
	"candidateMetadataFiles": [],
	"postCoverage": {},
	"samples": [],
	"errors": [],
}

if root.exists():
	for path in sorted(root.iterdir()):
		try:
			stats = path.stat()
			result["topLevel"].append({
				"name": path.name,
				"isFile": path.is_file(),
				"isDirectory": path.is_dir(),
				"size": stats.st_size,
			})
		except Exception as error:
			result["errors"].append({"path": str(path), "error": str(error)})

for current_root, directories, files in os.walk(root):
	directories.sort()
	files.sort()
	for name in files:
		path = Path(current_root) / name
		lower = name.lower()
		if any(token in lower for token in ("manifest", "index", "mapping", "source", "post", "job", "config", "state", "metadata", "summary")):
			try:
				stats = path.stat()
				result["candidateMetadataFiles"].append({
					"relativePath": str(path.relative_to(root)),
					"size": stats.st_size,
				})
			except Exception as error:
				result["errors"].append({"path": str(path), "error": str(error)})

coverage = collections.defaultdict(lambda: {
	"chunkDirectories": [],
	"promptFiles": [],
	"responseFiles": [],
	"otherFiles": [],
})

if chunk_root.exists():
	for chunk_dir in sorted(path for path in chunk_root.iterdir() if path.is_dir()):
		match = post_pattern.search(chunk_dir.name)
		if not match:
			continue
		post_id = match.group(1)
		entry = coverage[post_id]
		entry["chunkDirectories"].append(chunk_dir.name)
		for path in sorted(chunk_dir.iterdir()):
			if not path.is_file():
				continue
			relative = str(path.relative_to(root))
			name = path.name.lower()
			if "prompt" in name:
				entry["promptFiles"].append(relative)
			elif "response" in name:
				entry["responseFiles"].append(relative)
			else:
				entry["otherFiles"].append(relative)

for post_id, entry in sorted(coverage.items()):
	entry["chunkCount"] = len(entry["chunkDirectories"])
	entry["promptFileCount"] = len(entry["promptFiles"])
	entry["responseFileCount"] = len(entry["responseFiles"])
	entry["otherFileCount"] = len(entry["otherFiles"])
	result["postCoverage"][post_id] = entry

for post_id in sorted(result["postCoverage"])[:5]:
	entry = result["postCoverage"][post_id]
	for relative in entry["promptFiles"][:2]:
		path = root / relative
		try:
			text = path.read_text(errors="replace")
			result["samples"].append({
				"postId": post_id,
				"relativePath": relative,
				"size": len(text),
				"sample": text[:3000],
			})
		except Exception as error:
			result["errors"].append({"path": str(path), "error": str(error)})

result["uniquePostCount"] = len(result["postCoverage"])
result["totalChunkDirectoryCount"] = sum(entry["chunkCount"] for entry in result["postCoverage"].values())
result["postsWithPrompts"] = sum(bool(entry["promptFileCount"]) for entry in result["postCoverage"].values())
result["postsWithResponses"] = sum(bool(entry["responseFileCount"]) for entry in result["postCoverage"].values())
result["postsMissingPrompts"] = [post_id for post_id, entry in result["postCoverage"].items() if not entry["promptFileCount"]]
result["postsMissingResponses"] = [post_id for post_id, entry in result["postCoverage"].items() if not entry["responseFileCount"]]

print(json.dumps(result, ensure_ascii=False, indent=2))
PY
printf "%s\n" "$?" > /tmp/meluket_translation_job_probe.done
