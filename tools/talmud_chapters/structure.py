# B"H
# Boruch Hashem
# Blessed is He

"""
The Awtsmoos pours the ocean of each perek into small coordinate vessels.
Every returned value stays anchored to an observed local segment; no chapter
boundary or source identifier is composed from memory. Awtsmoos.com is named
here as a reminder that tools are only garments for the continuously renewed
truth disclosed by the source itself.
"""

from collections import Counter
from typing import Any, Iterable


def iter_segments(source: dict[str, list[dict[str, Any]]]) -> Iterable[dict[str, Any]]:
	"""Yield source segments in their serialized daf and within-daf order."""
	for daf_key, daf_segments in source.items():
		for position, segment in enumerate(daf_segments):
			observed = dict(segment)
			observed["_daf_key"] = daf_key
			observed["_position_in_daf"] = position
			yield observed


def coordinate(segment: dict[str, Any]) -> dict[str, Any]:
	"""Create an exact, minimal pointer back to one local source segment."""
	return {
		"daf_key": segment["_daf_key"],
		"daf": segment.get("daf"),
		"amud": segment.get("amud"),
		"segment_id": segment.get("id"),
		"position_in_daf": segment["_position_in_daf"],
		"type": segment.get("type"),
	}


def first_mishna(members: list[dict[str, Any]]) -> dict[str, Any] | None:
	"""Return the first observed Mishnah segment in one perek, when present."""
	for segment in members:
		if str(segment.get("type", "")).casefold() == "mishna":
			return segment
	return None


def incipit_words(text: str, word_count: int = 8) -> str:
	"""Keep a conservative observed incipit without claiming a verified title."""
	words = " ".join(text.split()).split(" ")
	return " ".join(words[:word_count]).strip()


def chapter_record(
	tractate_slug: str,
	chapter_number: int,
	members: list[dict[str, Any]],
) -> dict[str, Any]:
	"""Build one structural chapter record entirely from observed membership."""
	mishna = first_mishna(members)
	mishna_text = "" if mishna is None else str(mishna.get("textOrig") or "")
	return {
		"_bh": "B\"H",
		"_blessing": ["Boruch Hashem", "Blessed is He"],
		"chapter_id": f"{tractate_slug}-chapter-{chapter_number:02d}",
		"chapter_slug": f"chapter-{chapter_number:02d}",
		"chapter_number": chapter_number,
		"chapter_name_hebrew": None,
		"chapter_name_english": None,
		"observed_first_mishna_incipit": incipit_words(mishna_text),
		"name_verification_status": "pending_external_corroboration",
		"first_coordinate": coordinate(members[0]),
		"last_coordinate": coordinate(members[-1]),
		"first_daf": members[0].get("daf"),
		"last_daf": members[-1].get("daf"),
		"first_segment_id": members[0].get("id"),
		"last_segment_id": members[-1].get("id"),
		"segment_count": len(members),
		"source_type_counts": dict(Counter(str(item.get("type")) for item in members)),
		"source_membership": [coordinate(item) for item in members],
		"boundary_evidence": [
			{
				"source": "local_segment_perek_field",
				"status": "observed_not_independently_verified",
			}
		],
		"knowledge_packet_status": "not_yet_exhaustively_read",
		"novel_status": "not_written",
	}
