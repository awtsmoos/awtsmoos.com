#!/bin/zsh
/usr/bin/python3 - <<'PY' > /tmp/meluket_all_packed_scan.json
import collections
import json
import os
import re
from pathlib import Path

root = Path("/Users/awtsmoos/Documents/dayuhChadash - Copy/socialPacked")
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
files = []
global_raw_found = set()
global_post_entity_found = set()
global_value_found = set()
errors = []

for current_root, directories, names in os.walk(root):
	directories.sort()
	names.sort()
	for name in names:
		path = Path(current_root) / name
		row = {"relativePath": str(path.relative_to(root))}
		try:
			data = path.read_bytes()
			row["size"] = len(data)
			row["prefixAscii"] = "".join(chr(byte) if 32 <= byte <= 126 else "." for byte in data[:80])
			raw_found = [post_id for post_id in expected_ids if post_id.encode("ascii") in data]
			row["rawExpectedIdCount"] = len(raw_found)
			row["rawExpectedIdSamples"] = raw_found[:10]
			global_raw_found.update(raw_found)

			if data.startswith(b"BH_AWTSOCIAL_JSONL_V1\n"):
				row["format"] = "BH_AWTSOCIAL_JSONL_V1"
				line_count = 0
				post_records = []
				matching_post_records = []
				value_matches = set()
				key_prefixes = collections.Counter()
				for raw_line in data.splitlines()[1:]:
					if not raw_line.strip():
						continue
					line_count += 1
					record = json.loads(raw_line)
					key = str(record.get("key") or "")
					parts = [part for part in key.split("/") if part]
					if parts:
						key_prefixes["/" + "/".join(parts[:min(3, len(parts))])] += 1
					value = record.get("value")
					serialized_value = json.dumps(value, ensure_ascii=False) if value is not None else ""
					for post_id in expected_ids:
						if post_id in serialized_value:
							value_matches.add(post_id)
					if key.startswith("/posts/"):
						post_id = None
						if isinstance(value, dict):
							post_id = value.get("id") or value.get("postId")
						post_row = {
							"key": key,
							"id": post_id,
							"author": value.get("author") if isinstance(value, dict) else None,
							"aliasId": value.get("aliasId") if isinstance(value, dict) else None,
							"titlePresent": bool((value or {}).get("title")) if isinstance(value, dict) else False,
							"contentPresent": bool((value or {}).get("content")) if isinstance(value, dict) else False,
						}
						post_records.append(post_row)
						if post_id in expected_set:
							matching_post_records.append(post_row)
							global_post_entity_found.add(post_id)
				row["jsonRecordCount"] = line_count
				row["postRecordCount"] = len(post_records)
				row["postRecordSamples"] = post_records[:10]
				row["matchingPostRecordCount"] = len(matching_post_records)
				row["matchingPostRecords"] = matching_post_records[:20]
				row["expectedIdsInValuesCount"] = len(value_matches)
				row["expectedIdsInValuesSamples"] = sorted(value_matches)[:20]
				row["topKeyPrefixes"] = key_prefixes.most_common(20)
				global_value_found.update(value_matches)
			else:
				row["format"] = "unknown"
		except Exception as error:
			row["error"] = f"{type(error).__name__}: {error}"
			errors.append({"path": str(path), "error": row["error"]})
		files.append(row)

print(json.dumps({
	"mode": "read_only",
	"root": str(root),
	"expectedIdCount": len(expected_ids),
	"fileCount": len(files),
	"globalRawFoundCount": len(global_raw_found),
	"globalPostEntityFoundCount": len(global_post_entity_found),
	"globalValueFoundCount": len(global_value_found),
	"globalRawFoundIds": sorted(global_raw_found),
	"globalPostEntityFoundIds": sorted(global_post_entity_found),
	"globalValueFoundIds": sorted(global_value_found),
	"missingAsPostEntities": sorted(expected_set - global_post_entity_found),
	"files": files,
	"errors": errors,
}, ensure_ascii=False, indent=2))
PY
printf "%s\n" "$?" > /tmp/meluket_all_packed_scan.done
