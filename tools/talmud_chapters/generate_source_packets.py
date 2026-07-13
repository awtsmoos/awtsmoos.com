# B"H
# Boruch Hashem
# Blessed is He

"""
The Awtsmoos renews every source letter without losing its place in the sea.
This generator serves Awtsmoos.com by gathering exact, uncompressed local
segments into perek vessels while clearly refusing to call copying "reading."
"""

import hashlib
import json
from collections import defaultdict
from pathlib import Path
from typing import Any

from tools.talmud_chapters.structure import coordinate, iter_segments

SOURCE_ROOT = Path("/Users/awtsmoos/Documents/awtsmoos/docs/Torah/Talmud")
OUTPUT_ROOT = Path("/Users/awtsmoos/Documents/awtsmoos/docs/Torah/Talmud-Chapters")


def read_json(path: Path) -> Any:
	"""Read one complete JSON artifact."""
	return json.loads(path.read_text())


def write_json(path: Path, value: Any) -> None:
	"""Rewrite one complete JSON artifact with tab indentation."""
	path.parent.mkdir(parents=True, exist_ok=True)
	path.write_text(json.dumps(value, ensure_ascii=False, indent="\t") + "\n")


def clean_segment(segment: dict[str, Any]) -> dict[str, Any]:
	"""Remove generator-only coordinates while preserving every source field."""
	return {
		key: value
		for key, value in segment.items()
		if not key.startswith("_")
	}


def packet_member(segment: dict[str, Any]) -> dict[str, Any]:
	"""Join an exact source coordinate to the untouched serialized segment."""
	return {
		"coordinate": coordinate(segment),
		"source_segment": clean_segment(segment),
	}


def write_packet(
	slug: str,
	source_path: Path,
	source_hash: str,
	chapter_number: int,
	members: list[dict[str, Any]],
) -> None:
	"""Write one lossless source packet and link its structural chapter."""
	chapter_slug = f"chapter-{chapter_number:02d}"
	packet_path = OUTPUT_ROOT / slug / "source" / f"{chapter_slug}.json"
	packet = {
		"_bh": "B\"H",
		"_blessing": ["Boruch Hashem", "Blessed is He"],
		"chapter_id": f"{slug}-{chapter_slug}",
		"chapter_number": chapter_number,
		"source_file": source_path.name,
		"source_sha256": source_hash,
		"segment_count": len(members),
		"first_coordinate": coordinate(members[0]),
		"last_coordinate": coordinate(members[-1]),
		"packet_status": "lossless_source_copy_not_manually_analyzed",
		"segments": [packet_member(member) for member in members],
	}
	write_json(packet_path, packet)
	packet_hash = hashlib.sha256(packet_path.read_bytes()).hexdigest()
	chapter_path = OUTPUT_ROOT / slug / "chapters" / f"{chapter_slug}.json"
	chapter = read_json(chapter_path)
	chapter["source_packet_path"] = str(packet_path.relative_to(OUTPUT_ROOT))
	chapter["source_packet_sha256"] = packet_hash
	chapter["source_packet_status"] = packet["packet_status"]
	write_json(chapter_path, chapter)


def generate_tractate(source_path: Path) -> dict[str, Any]:
	"""Create every perek packet for one immutable source tractate."""
	raw = source_path.read_bytes()
	source = json.loads(raw)
	slug = source_path.stem.removeprefix("talmud_")
	grouped: dict[int, list[dict[str, Any]]] = defaultdict(list)
	for segment in iter_segments(source):
		grouped[int(segment["perek"])].append(segment)
	for number in sorted(grouped):
		write_packet(slug, source_path, hashlib.sha256(raw).hexdigest(), number, grouped[number])
	return {
		"source_slug": slug,
		"chapter_packet_count": len(grouped),
		"segment_count": sum(len(members) for members in grouped.values()),
	}


def main() -> None:
	"""Generate all lossless packets and one corpus-level receipt."""
	tractates = [generate_tractate(path) for path in sorted(SOURCE_ROOT.glob("talmud_*.json"))]
	write_json(OUTPUT_ROOT / "manifest" / "source-packets.json", {
		"_bh": "B\"H",
		"_blessing": ["Boruch Hashem", "Blessed is He"],
		"tractate_count": len(tractates),
		"chapter_packet_count": sum(item["chapter_packet_count"] for item in tractates),
		"segment_count": sum(item["segment_count"] for item in tractates),
		"tractates": tractates,
	})


if __name__ == "__main__":
	main()
