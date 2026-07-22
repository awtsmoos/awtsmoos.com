#!/bin/zsh
/usr/bin/python3 - <<'PY' > /tmp/meluket_jsonl_structure_probe.json
import base64
import collections
import json
from pathlib import Path

source = Path("/Users/awtsmoos/Documents/dayuhChadash - Copy/socialPacked/social.core.awtsocial")
operation_counts = collections.Counter()
record_type_counts = collections.Counter()
key_prefix_counts = collections.Counter()
field_counts = collections.Counter()
samples = []
invalid = []
all_text_hits = collections.Counter()
line_count = 0
json_count = 0

with source.open("rb") as handle:
	header = handle.readline().rstrip(b"\r\n")
	for raw_line in handle:
		line_count += 1
		line = raw_line.strip()
		if not line:
			continue
		try:
			record = json.loads(line)
		except Exception as error:
			if len(invalid) < 20:
				invalid.append({"line": line_count + 1, "error": f"{type(error).__name__}: {error}", "sample": line[:300].decode("utf-8", "replace")})
			continue
		json_count += 1
		if not isinstance(record, dict):
			continue
		operation_counts[str(record.get("op"))] += 1
		record_type_counts[str(record.get("recordType"))] += 1
		for field in record:
			field_counts[field] += 1
		key = str(record.get("key") or "")
		parts = [part for part in key.split("/") if part]
		if parts:
			key_prefix_counts["/" + "/".join(parts[: min(3, len(parts))])] += 1
		text = line.decode("utf-8", "replace").lower()
		for token in ("meluket", "therebbe", "seferhamaamarimmeluket", "bh_post_"):
			if token in text:
				all_text_hits[token] += 1
		if len(samples) < 25:
			shallow = {}
			for field, value in record.items():
				if isinstance(value, str):
					shallow[field] = value[:500]
				elif isinstance(value, (int, float, bool)) or value is None:
					shallow[field] = value
				elif isinstance(value, list):
					shallow[field] = {"type": "list", "length": len(value), "sample": value[:3]}
				elif isinstance(value, dict):
					shallow[field] = {"type": "dict", "keys": list(value.keys())[:30]}
				else:
					shallow[field] = {"type": type(value).__name__}
			samples.append(shallow)

print(json.dumps({
	"mode": "read_only",
	"source": str(source),
	"header": header.decode("utf-8", "replace"),
	"line_count": line_count,
	"json_record_count": json_count,
	"invalid_count": len(invalid),
	"operation_counts": operation_counts,
	"record_type_counts": record_type_counts,
	"field_counts": field_counts,
	"top_key_prefixes": key_prefix_counts.most_common(100),
	"plaintext_hit_line_counts": all_text_hits,
	"samples": samples,
	"invalid_samples": invalid,
}, ensure_ascii=False, indent=2))
PY
printf "%s\n" "$?" > /tmp/meluket_jsonl_structure_probe.done
