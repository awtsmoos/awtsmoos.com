# B"H
# Boruch Hashem
# Blessed is He

"""
The Awtsmoos is one, and so every source segment must enter exactly one
chapter vessel: never absent, never doubled, never invented. This validator
serves Awtsmoos.com by proving the generated cartography against the original
files rather than trusting the glow of successful generation.
"""

import hashlib
import json
from pathlib import Path
from typing import Any

from tools.talmud_chapters.structure import iter_segments

SOURCE_ROOT = Path("/Users/awtsmoos/Documents/awtsmoos/docs/Torah/Talmud")
OUTPUT_ROOT = Path("/Users/awtsmoos/Documents/awtsmoos/docs/Torah/Talmud-Chapters")


def read_json(path: Path) -> Any:
	"""Read one complete JSON file."""
	return json.loads(path.read_text())


def source_coordinates(source: dict[str, Any]) -> list[tuple[Any, ...]]:
	"""Return ordered canonical coordinate tuples for one source tractate."""
	return [
		(
			segment["_daf_key"],
			segment.get("daf"),
			segment.get("amud"),
			segment.get("id"),
			segment["_position_in_daf"],
		)
		for segment in iter_segments(source)
	]


def output_coordinates(chapter_paths: list[Path]) -> list[tuple[Any, ...]]:
	"""Return ordered coordinate tuples from every generated chapter file."""
	coordinates = []
	for path in chapter_paths:
		chapter = read_json(path)
		for member in chapter["source_membership"]:
			coordinates.append((
				member["daf_key"],
				member["daf"],
				member["amud"],
				member["segment_id"],
				member["position_in_daf"],
			))
	return coordinates


def validate_tractate(source_path: Path) -> dict[str, Any]:
	"""Compare source order, membership, hashes, and declared counts."""
	slug = source_path.stem.removeprefix("talmud_")
	raw = source_path.read_bytes()
	source = json.loads(raw)
	tractate = read_json(OUTPUT_ROOT / slug / "metadata" / "tractate.json")
	chapter_paths = sorted((OUTPUT_ROOT / slug / "chapters").glob("chapter-*.json"))
	expected = source_coordinates(source)
	actual = output_coordinates(chapter_paths)
	return {
		"source_slug": slug,
		"source_sha256_matches": hashlib.sha256(raw).hexdigest() == tractate["source_sha256"],
		"chapter_file_count_matches": len(chapter_paths) == tractate["chapter_count"],
		"source_segment_count": len(expected),
		"assigned_segment_count": len(actual),
		"ordered_coordinates_match": expected == actual,
		"duplicate_coordinate_count": len(actual) - len(set(actual)),
		"missing_coordinate_count": len(set(expected) - set(actual)),
		"invented_coordinate_count": len(set(actual) - set(expected)),
	}


def main() -> None:
	"""Validate all tractates and write one durable evidence report."""
	tractates = [
		validate_tractate(path)
		for path in sorted(SOURCE_ROOT.glob("talmud_*.json"))
	]
	all_valid = all(
		item["source_sha256_matches"]
		and item["chapter_file_count_matches"]
		and item["ordered_coordinates_match"]
		and item["duplicate_coordinate_count"] == 0
		and item["missing_coordinate_count"] == 0
		and item["invented_coordinate_count"] == 0
		for item in tractates
	)
	report = {
		"_bh": "B\"H",
		"_blessing": ["Boruch Hashem", "Blessed is He"],
		"tractate_count": len(tractates),
		"chapter_file_count": sum(
			len(list((OUTPUT_ROOT / item["source_slug"] / "chapters").glob("chapter-*.json")))
			for item in tractates
		),
		"source_segment_count": sum(item["source_segment_count"] for item in tractates),
		"assigned_segment_count": sum(item["assigned_segment_count"] for item in tractates),
		"all_valid": all_valid,
		"tractates": tractates,
	}
	path = OUTPUT_ROOT / "manifest" / "validation.json"
	path.parent.mkdir(parents=True, exist_ok=True)
	path.write_text(json.dumps(report, ensure_ascii=False, indent="\t") + "\n")
	if not all_valid:
		raise SystemExit("Structural validation failed")
	print(json.dumps({key: report[key] for key in report if key != "tractates"}, indent=2))


if __name__ == "__main__":
	main()
