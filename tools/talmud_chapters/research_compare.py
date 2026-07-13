# B"H
# Boruch Hashem
# Blessed is He

"""
The Awtsmoos reveals one perek through local, Sefaria, and Wikisource vessels.
This Awtsmoos.com comparator records exact relations, compatible variants,
and real disagreements without converting any source into another.
"""

import re
from typing import Any

from tools.talmud_chapters.hebrew_compare import local_incipit_relation, name_relation

HEBREW_QUOTES = re.compile(r'["״“”]([^"״“”]+)["״“”]')
SEFARIA_RANGE = re.compile(r"(\d+)([ab]):(\d+)")


def wikisource_name(section: dict[str, Any]) -> str | None:
	"""Extract the quoted traditional perek name from one section heading."""
	match = HEBREW_QUOTES.search(section.get("line", ""))
	return None if match is None else match.group(1).strip()


def english_name(sefaria_title: str | None) -> str | None:
	"""Remove the ordinal prefix from a Sefaria traditional display title."""
	if not sefaria_title:
		return None
	return sefaria_title.split(";", 1)[-1].strip()


def range_endpoints(whole_ref: str) -> tuple[tuple[int, int], tuple[int, int]]:
	"""Read first and last daf/amud pairs from an explicit Sefaria range."""
	matches = SEFARIA_RANGE.findall(whole_ref)
	if len(matches) < 2:
		raise ValueError(f"Unrecognized Sefaria chapter range: {whole_ref}")
	pairs = [
		(int(daf), 0 if amud == "a" else 1)
		for daf, amud, _ in matches
	]
	return pairs[0], pairs[-1]


def compare_chapter(
	local: dict[str, Any],
	sefaria: dict[str, Any],
	wiki_section: dict[str, Any],
) -> dict[str, Any]:
	"""Compare names and amud boundaries across three observed witnesses."""
	wiki_name = wikisource_name(wiki_section)
	sefaria_name = sefaria["chapter_name_hebrew"]
	start, end = range_endpoints(sefaria["sefaria_whole_ref"])
	local_start = (
		local["first_coordinate"]["daf"],
		local["first_coordinate"]["amud"],
	)
	local_end = (
		local["last_coordinate"]["daf"],
		local["last_coordinate"]["amud"],
	)
	external_relation = name_relation(sefaria_name, wiki_name)
	incipit_relation = local_incipit_relation(
		local["observed_first_mishna_incipit"],
		sefaria_name,
		wiki_name,
	)
	boundary_match = start == local_start and end == local_end
	verified = (
		external_relation not in {"different", "missing"}
		and incipit_relation != "different"
		and boundary_match
	)
	return {
		"chapter_number": local["chapter_number"],
		"chapter_name_hebrew": sefaria_name,
		"chapter_name_english": english_name(sefaria["chapter_name_english"]),
		"wikisource_name": wiki_name,
		"sefaria_whole_ref": sefaria["sefaria_whole_ref"],
		"external_name_relation": external_relation,
		"local_incipit_relation": incipit_relation,
		"external_name_match": external_relation not in {"different", "missing"},
		"local_incipit_match": incipit_relation != "different",
		"external_boundary_amud_match": boundary_match,
		"verified": verified,
	}
