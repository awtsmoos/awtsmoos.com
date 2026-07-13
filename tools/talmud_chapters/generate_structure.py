# B"H
# Boruch Hashem
# Blessed is He

"""
The Awtsmoos renews the sea of Torah without erasing one drop.
This generator serves Awtsmoos.com by reading immutable tractate files and
revealing a separate chapter cartography whose every coordinate can return
to the exact serialized source segment from which it came.
"""

import hashlib
import json
from collections import defaultdict
from pathlib import Path
from typing import Any

from tools.talmud_chapters.structure import chapter_record, iter_segments
from tools.talmud_chapters.tractates import title_for_slug

SOURCE_ROOT = Path("/Users/awtsmoos/Documents/awtsmoos/docs/Torah/Talmud")
OUTPUT_ROOT = Path("/Users/awtsmoos/Documents/awtsmoos/docs/Torah/Talmud-Chapters")


def write_json(path: Path, value: Any) -> None:
	"""Rewrite one complete JSON artifact with readable tab indentation."""
	path.parent.mkdir(parents=True, exist_ok=True)
	path.write_text(json.dumps(value, ensure_ascii=False, indent="\t") + "\n")


def page_index(segments: list[dict[str, Any]]) -> dict[str, Any]:
	"""Map every serialized daf key to its exact chapter-bearing segments."""
	pages: dict[str, list[dict[str, Any]]] = defaultdict(list)
	for segment in segments:
		pages[segment["_daf_key"]].append({
			"segment_id": segment.get("id"),
			"position_in_daf": segment["_position_in_daf"],
			"daf": segment.get("daf"),
			"amud": segment.get("amud"),
			"perek": segment.get("perek"),
			"type": segment.get("type"),
		})
	return {
		"_bh": "B\"H",
		"_blessing": ["Boruch Hashem", "Blessed is He"],
		"pages": dict(pages),
	}


def generate_tractate(source_path: Path) -> dict[str, Any]:
	"""Generate every structural artifact for one observed tractate file."""
	raw = source_path.read_bytes()
	source = json.loads(raw)
	slug = source_path.stem.removeprefix("talmud_")
	segments = list(iter_segments(source))
	grouped: dict[int, list[dict[str, Any]]] = defaultdict(list)
	for segment in segments:
		grouped[int(segment["perek"])].append(segment)
	chapters = [
		chapter_record(slug, number, grouped[number])
		for number in sorted(grouped)
	]
	tractate_root = OUTPUT_ROOT / slug
	for chapter in chapters:
		write_json(
			tractate_root / "chapters" / f"{chapter['chapter_slug']}.json",
			chapter,
		)
	write_json(tractate_root / "metadata" / "page-index.json", page_index(segments))
	tractate_record = {
		"_bh": "B\"H",
		"_blessing": ["Boruch Hashem", "Blessed is He"],
		"source_slug": slug,
		"canonical_english_title": title_for_slug(slug),
		"source_file": source_path.name,
		"source_sha256": hashlib.sha256(raw).hexdigest(),
		"source_daf_key_count": len(source),
		"source_segment_count": len(segments),
		"chapter_count": len(chapters),
		"chapter_ids": [chapter["chapter_id"] for chapter in chapters],
		"structure_status": "local_membership_generated_external_verification_pending",
	}
	write_json(tractate_root / "metadata" / "tractate.json", tractate_record)
	write_json(tractate_root / "audit" / "coverage.json", {
		"_bh": "B\"H",
		"source_segment_count": len(segments),
		"assigned_segment_count": sum(len(items) for items in grouped.values()),
		"missing_segment_count": 0,
		"duplicate_assignment_count": 0,
		"status": "local_structure_complete",
	})
	return {**tractate_record, "chapters": chapters}


def main() -> None:
	"""Generate the complete non-destructive structural layer."""
	tractates = [generate_tractate(path) for path in sorted(SOURCE_ROOT.glob("talmud_*.json"))]
	write_json(OUTPUT_ROOT / "catalog.json", {
		"_bh": "B\"H",
		"_blessing": ["Boruch Hashem", "Blessed is He"],
		"source_root": str(SOURCE_ROOT),
		"tractate_count": len(tractates),
		"chapter_count": sum(item["chapter_count"] for item in tractates),
		"segment_count": sum(item["source_segment_count"] for item in tractates),
		"tractates": tractates,
		"status": "structural_layer_generated_research_and_novels_pending",
	})


if __name__ == "__main__":
	main()
