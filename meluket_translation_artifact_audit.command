#!/bin/zsh
/usr/bin/python3 - <<'PY' > /Users/awtsmoos/awtsmoos.com/meluket_translation_artifact_audit.json
import collections
import json
import os
import re
from pathlib import Path

job_root = Path("/Users/awtsmoos/Documents/awtsmoos-jobs/meluket-translation-job")
verify_path = Path("/Users/awtsmoos/awtsmoos.com/ai_thoughts/20260721-corpus-integrity-talmud-tanach-chassidus-rag/meluket-post-verification.json")
verification = json.loads(verify_path.read_text())
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
expected_ids = sorted({
	match.group(0)
	for value in strings
	for match in re.finditer(r"BH_POST_[A-Za-z0-9_-]+", value)
	if "_theRebbe_" in match.group(0)
})
expected_set = set(expected_ids)

matches = {post_id: [] for post_id in expected_ids}
file_count = 0
total_bytes = 0
extension_counts = collections.Counter()
errors = []
sample_files = []

for current_root, directories, files in os.walk(job_root):
	directories.sort()
	files.sort()
	for name in files:
		path = Path(current_root) / name
		file_count += 1
		try:
			data = path.read_bytes()
			total_bytes += len(data)
			extension_counts[path.suffix.lower() or "<none>"] += 1
			text = data.decode("utf-8", "replace")
			found_ids = sorted(expected_set.intersection(re.findall(r"BH_POST_[A-Za-z0-9_-]+", text)))
			if not found_ids:
				found_ids = [post_id for post_id in expected_ids if post_id in name]
			for post_id in found_ids:
				matches[post_id].append({
					"path": str(path),
					"relativePath": str(path.relative_to(job_root)),
					"size": len(data),
					"prefix": text[:500],
				})
			if len(sample_files) < 100 and any(token in name.lower() for token in ("prompt", "chunk", "response", "manifest", "map", "report")):
				sample_files.append({
					"relativePath": str(path.relative_to(job_root)),
					"size": len(data),
					"prefix": text[:300],
				})
		except Exception as error:
			errors.append({"path": str(path), "error": f"{type(error).__name__}: {error}"})

matched_ids = [post_id for post_id, rows in matches.items() if rows]
missing_ids = [post_id for post_id, rows in matches.items() if not rows]
path_kind_counts = collections.Counter()
for rows in matches.values():
	for row in rows:
		lower = row["relativePath"].lower()
		kind = "other"
		for candidate in ("prompt", "response", "chunk", "manifest", "report", "source", "input", "output"):
			if candidate in lower:
				kind = candidate
				break
		path_kind_counts[kind] += 1

print(json.dumps({
	"mode": "read_only",
	"jobRoot": str(job_root),
	"jobRootExists": job_root.exists(),
	"expectedIdCount": len(expected_ids),
	"matchedIdCount": len(matched_ids),
	"missingIdCount": len(missing_ids),
	"fileCount": file_count,
	"totalBytes": total_bytes,
	"extensionCounts": extension_counts,
	"pathKindCounts": path_kind_counts,
	"matchCountById": {post_id: len(matches[post_id]) for post_id in expected_ids},
	"matchedIds": matched_ids,
	"missingIds": missing_ids,
	"matchSamples": {post_id: matches[post_id][:10] for post_id in matched_ids[:20]},
	"sampleFiles": sample_files,
	"errors": errors,
}, ensure_ascii=False, indent=2))
PY
printf "%s\n" "$?" > /Users/awtsmoos/awtsmoos.com/meluket_translation_artifact_audit.done
