# B"H
# Boruch Hashem
# Blessed is He

"""
The Awtsmoos gathers witnesses by ordinal without discarding a missing voice.
This Awtsmoos.com vessel applies research chapter by chapter, preserving every
variant and leaving incomplete corroboration visible for manual review.
"""

import json
import re
from pathlib import Path
from typing import Any

from tools.talmud_chapters.research_compare import compare_chapter, english_name, wikisource_name

OUTPUT_ROOT = Path("/Users/awtsmoos/Documents/awtsmoos/docs/Torah/Talmud-Chapters")
NUMBER_PATTERN = re.compile(r"\d+")


def read_json(path: Path) -> Any:
	"""Read one complete JSON artifact."""
	return json.loads(path.read_text())


def write_json(path: Path, value: Any) -> None:
	"""Rewrite one complete JSON artifact with tab indentation."""
	path.write_text(json.dumps(value, ensure_ascii=False, indent="\t") + "\n")


def section_number(section: dict[str, Any]) -> int | None:
	"""Read the first explicit ordinal number from a Wikisource section."""
	match = NUMBER_PATTERN.search(str(section.get("number", "")))
	return None if match is None else int(match.group())


def section_index(sections: list[dict[str, Any]]) -> dict[int, dict[str, Any]]:
	"""Index chapter headings by observed ordinal without positional guessing."""
	return {
		number: section
		for section in sections
		if (number := section_number(section)) is not None
	}


def merge_chapter(
	local: dict[str, Any],
	sefaria: dict[str, Any],
	wiki_section: dict[str, Any],
	witness: dict[str, Any],
	observed_at: str,
) -> tuple[dict[str, Any], dict[str, Any]]:
	"""Return one rewritten chapter and its explicit comparison report."""
	comparison = compare_chapter(local, sefaria, wiki_section)
	merged = dict(local)
	merged["chapter_name_hebrew"] = sefaria["chapter_name_hebrew"]
	merged["chapter_name_english"] = english_name(sefaria["chapter_name_english"])
	merged["chapter_name_english_kind"] = "traditional_name_transliteration"
	merged["chapter_name_hebrew_wikisource_variant"] = wikisource_name(wiki_section)
	merged["sefaria_whole_ref"] = sefaria["sefaria_whole_ref"]
	merged["verification_checks"] = {
		"sefaria_wikisource_name_relation": comparison["external_name_relation"],
		"local_incipit_relation": comparison["local_incipit_relation"],
		"sefaria_local_boundary_amud_match": comparison["external_boundary_amud_match"],
	}
	merged["name_verification_status"] = (
		"verified_by_local_sefaria_and_wikisource"
		if comparison["verified"]
		else "source_difference_requires_manual_review"
	)
	merged["boundary_verification_status"] = (
		"verified_by_local_and_sefaria_at_amud_level"
		if comparison["external_boundary_amud_match"]
		else "source_difference_requires_manual_review"
	)
	merged["boundary_evidence"] = [
		{
			"source": "local_segment_perek_field",
			"precision": "source_segment",
			"first_coordinate": local["first_coordinate"],
			"last_coordinate": local["last_coordinate"],
		},
		{
			"source": "Sefaria Index v2 Chapters structure",
			"retrieved_at": observed_at,
			"url": witness["sefaria_url"],
			"range": sefaria["sefaria_whole_ref"],
		},
		{
			"source": "Hebrew Wikisource Mishnah chapter heading",
			"retrieved_at": observed_at,
			"page": witness["wikisource_page"],
			"heading": wiki_section.get("line"),
		},
	]
	return merged, comparison


def process_tractate(witness: dict[str, Any], observed_at: str) -> dict[str, Any]:
	"""Apply aligned local, Sefaria, and Wikisource evidence to one tractate."""
	slug = witness["source_slug"]
	paths = sorted((OUTPUT_ROOT / slug / "chapters").glob("chapter-*.json"))
	sefaria = witness["sefaria_chapters"]
	wiki = section_index(witness["wikisource_chapter_sections"])
	if len(paths) != len(sefaria):
		return {
			"source_slug": slug,
			"status": "local_sefaria_chapter_count_difference",
			"local_count": len(paths),
			"sefaria_count": len(sefaria),
		}
	comparisons = []
	for path, sefaria_chapter in zip(paths, sefaria):
		number = sefaria_chapter["chapter_number"]
		merged, comparison = merge_chapter(
			read_json(path),
			sefaria_chapter,
			wiki.get(number, {}),
			witness,
			observed_at,
		)
		write_json(path, merged)
		comparisons.append(comparison)
	return {
		"source_slug": slug,
		"status": "compared",
		"chapter_count": len(comparisons),
		"wikisource_heading_count": len(wiki),
		"verified_count": sum(item["verified"] for item in comparisons),
		"manual_review_count": sum(not item["verified"] for item in comparisons),
		"chapters": comparisons,
	}
