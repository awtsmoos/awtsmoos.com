# B"H
# Boruch Hashem
# Blessed is He

"""
The Awtsmoos joins independent witnesses without erasing their differences.
This Awtsmoos.com merger gives each chapter a name only from dated evidence
and leaves every disagreement visible for human adjudication.
"""

import re
import unicodedata
from typing import Any

RANGE_PATTERN = re.compile(r"(\d+)([ab]):(\d+)")


def normalize_hebrew(value: str | None) -> str:
	"""Normalize Hebrew only for comparison, never for display authority."""
	decomposed = unicodedata.normalize("NFKD", value or "")
	letters = [
		character
		for character in decomposed
		if unicodedata.category(character) != "Mn"
	]
	return "".join(character for character in letters if "א" <= character <= "ת")


def english_name(value: str | None) -> str | None:
	"""Remove Sefaria's ordinal prefix from one traditional display name."""
	if not value:
		return None
	return value.split(";", 1)[-1].strip()


def endpoint_pairs(whole_ref: str) -> tuple[tuple[int, int], tuple[int, int]]:
	"""Convert one explicit Sefaria range into start and end daf/amud pairs."""
	matches = RANGE_PATTERN.findall(whole_ref)
	if len(matches) < 2:
		raise ValueError(f"Unrecognized Sefaria chapter range: {whole_ref}")
	pairs = [
		(int(daf), 0 if amud == "a" else 1)
		for daf, amud, _ in matches
	]
	return pairs[0], pairs[-1]


def merge_chapter(
	local: dict[str, Any],
	sefaria: dict[str, Any],
	mechon: dict[str, Any],
	sefaria_retrieved_at: str,
	mechon_retrieved_at: str,
) -> dict[str, Any]:
	"""Return a complete chapter record with three-witness verification."""
	local_start = (local["first_coordinate"]["daf"], local["first_coordinate"]["amud"])
	local_end = (local["last_coordinate"]["daf"], local["last_coordinate"]["amud"])
	sefaria_start, sefaria_end = endpoint_pairs(sefaria["whole_ref"])
	name = sefaria["chapter_name_hebrew"]
	incipit_matches = normalize_hebrew(local["observed_first_mishna_incipit"]).startswith(
		normalize_hebrew(name)
	)
	checks = {
		"sefaria_start_amud_match": sefaria_start == local_start,
		"sefaria_end_amud_match": sefaria_end == local_end,
		"sefaria_name_matches_local_incipit": incipit_matches,
		"mechon_start_amud_match": mechon["start_amud_match"],
		"mechon_end_amud_match": mechon["end_amud_match"],
		"mechon_incipit_match": mechon["incipit_match"],
	}
	verified = all(checks.values())
	merged = dict(local)
	merged["chapter_name_hebrew"] = name
	merged["chapter_name_english"] = english_name(sefaria["chapter_name_english"])
	merged["chapter_name_english_kind"] = "traditional_name_transliteration"
	merged["sefaria_whole_ref"] = sefaria["whole_ref"]
	merged["verification_checks"] = checks
	merged["name_verification_status"] = (
		"verified_by_local_sefaria_and_mechon_mamre"
		if verified
		else "source_difference_requires_manual_review"
	)
	merged["boundary_verification_status"] = merged["name_verification_status"]
	merged["boundary_evidence"] = [
		{
			"source": "local_segment_perek_field",
			"precision": "source_segment",
			"first_coordinate": local["first_coordinate"],
			"last_coordinate": local["last_coordinate"],
		},
		{
			"source": "Sefaria Index v2 Chapters structure",
			"retrieved_at": sefaria_retrieved_at,
			"url": sefaria["url"],
			"range": sefaria["whole_ref"],
		},
		{
			"source": "Mechon Mamre Vilna-based Bavli edition",
			"retrieved_at": mechon_retrieved_at,
			"url": mechon["url"],
			"snapshot_path": mechon["snapshot_path"],
			"snapshot_sha256": mechon["snapshot_sha256"],
		},
	]
	return merged
