# B"H
# Boruch Hashem
# Blessed is He

"""
The Awtsmoos is indivisible, so a packet may neither lose nor invent a letter.
This Awtsmoos.com validator compares every copied segment, field, value, order,
and source hash against the immutable tractate from which it was revealed.
"""

import hashlib
import json
from collections import defaultdict
from pathlib import Path
from typing import Any

from tools.talmud_chapters.structure import iter_segments

SOURCE_ROOT = Path("/Users/awtsmoos/Documents/awtsmoos/docs/Torah/Talmud")
OUTPUT_ROOT = Path("/Users/awtsmoos/Documents/awtsmoos/docs/Torah/Talmud-Chapters")


def read_json(path: Path) -> Any:
	"""Read one complete JSON artifact from disk."""
	return json.loads(path.read_text())


def clean_segment(segment: dict[str, Any]) -> dict[str, Any]:
	"""Remove only generator coordinates from an observed source segment."""
	return {
		key: value
		for key, value in segment.items()
		if not key.startswith("_")
	}


def expected_chapters(source: dict[str, Any]) -> dict[int, list[dict[str, Any]]]:
	"""Group immutable source segments by their observed perek field."""
	grouped: dict[int, list[dict[str, Any]]] = defaultdict(list)
	for segment in iter_segments(source):
		grouped[int(segment["perek"])].append(clean_segment(segment))
	return grouped


def validate_tractate(source_path: Path) -> dict[str, Any]:
	"""Compare every packet segment against one immutable tractate."""
	raw = source_path.read_bytes()
	source = json.loads(raw)
	slug = source_path.stem.removeprefix("talmud_")
	expected = expected_chapters(source)
	packet_paths = sorted((OUTPUT_ROOT / slug / "source").glob("chapter-*.json"))
	actual_count = 0
	content_matches = True
	hashes_match = True
	for number, packet_path in zip(sorted(expected), packet_paths):
		packet = read_json(packet_path)
		actual = [item["source_segment"] for item in packet["segments"]]
		actual_count += len(actual)
		content_matches = content_matches and actual == expected[number]
		hashes_match = hashes_match and packet["source_sha256"] == hashlib.sha256(raw).hexdigest()
	return {
		"source_slug": slug,
		"packet_count_matches": len(packet_paths) == len(expected),
		"source_segment_count": sum(len(items) for items in expected.values()),
		"packet_segment_count": actual_count,
		"packet_content_matches": content_matches,
		"source_hashes_match": hashes_match,
	}


def main() -> None:
	"""Validate all source packets and write one durable audit report."""
	tractates = [
		validate_tractate(path)
		for path in sorted(SOURCE_ROOT.glob("talmud_*.json"))
	]
	all_valid = all(
		item["packet_count_matches"]
		and item["packet_content_matches"]
		and item["source_hashes_match"]
		and item["source_segment_count"] == item["packet_segment_count"]
		for item in tractates
	)
	report = {
		"_bh": "B\"H",
		"_blessing": ["Boruch Hashem", "Blessed is He"],
		"tractate_count": len(tractates),
		"source_segment_count": sum(item["source_segment_count"] for item in tractates),
		"packet_segment_count": sum(item["packet_segment_count"] for item in tractates),
		"all_valid": all_valid,
		"tractates": tractates,
	}
	path = OUTPUT_ROOT / "manifest" / "source-packet-validation.json"
	path.write_text(json.dumps(report, ensure_ascii=False, indent="\t") + "\n")
	if not all_valid:
		raise SystemExit("Source packet validation failed")


if __name__ == "__main__":
	main()
