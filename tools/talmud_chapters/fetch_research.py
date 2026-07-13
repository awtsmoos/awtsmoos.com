# B"H
# Boruch Hashem
# Blessed is He

"""
The Awtsmoos reveals one ancient chapter name through independent witnesses.
This fetcher serves Awtsmoos.com by preserving dated Sefaria and Wikisource
snapshots, while every failed witness remains explicit and reproducible.
"""

from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode

from tools.talmud_chapters.research_http import fetch_json, write_json
from tools.talmud_chapters.tractates import TRACTATE_TITLES

OUTPUT_ROOT = Path("/Users/awtsmoos/Documents/awtsmoos/docs/Torah/Talmud-Chapters")
SNAPSHOT_ROOT = OUTPUT_ROOT / "research" / "snapshots"


def primary_hebrew_title(index: dict) -> str:
	"""Read the primary Hebrew title from a Sefaria index schema."""
	for title in index["schema"]["titles"]:
		if title.get("lang") == "he" and title.get("primary"):
			return title["text"]
	raise ValueError(f"No primary Hebrew title for {index.get('title')}")


def sefaria_chapters(index: dict) -> list[dict]:
	"""Extract chapter ordinals, names, and exact Sefaria ranges."""
	chapters = []
	for node in index["alt_structs"]["Chapters"]["nodes"]:
		titles = {
			item["lang"]: item["text"]
			for item in node["titles"]
			if item.get("primary")
		}
		chapters.append({
			"chapter_number": node["numeric_equivalent"],
			"chapter_name_hebrew": titles.get("he"),
			"chapter_name_english": titles.get("en"),
			"sefaria_whole_ref": node["wholeRef"],
		})
	return chapters


def wikisource_sections(hebrew_title: str) -> tuple[str, list[dict]]:
	"""Fetch Mishnah headings that independently display perek names."""
	page = f"משנה {hebrew_title}"
	query = urlencode({
		"action": "parse",
		"page": page,
		"prop": "sections",
		"format": "json",
		"formatversion": "2",
	})
	data = fetch_json(f"https://he.wikisource.org/w/api.php?{query}")
	sections = [
		section
		for section in data.get("parse", {}).get("sections", [])
		if "פרק" in section.get("line", "")
		and section.get("toclevel") == 1
	]
	return page, sections


def collect_tractate(slug: str, english_title: str, observed_at: str) -> dict:
	"""Collect and preserve both external witnesses for one tractate."""
	encoded_title = english_title.replace(" ", "%20")
	sefaria_url = f"https://www.sefaria.org/api/v2/raw/index/{encoded_title}"
	index = fetch_json(sefaria_url)
	write_json(SNAPSHOT_ROOT / "sefaria" / f"{slug}.json", index)
	hebrew_title = primary_hebrew_title(index)
	page, sections = wikisource_sections(hebrew_title)
	write_json(SNAPSHOT_ROOT / "wikisource" / f"{slug}.json", {
		"page": page,
		"sections": sections,
		"retrieved_at": observed_at,
	})
	return {
		"source_slug": slug,
		"sefaria_title": index["title"],
		"hebrew_title": hebrew_title,
		"sefaria_url": sefaria_url,
		"wikisource_page": page,
		"sefaria_chapters": sefaria_chapters(index),
		"wikisource_chapter_sections": sections,
	}


def main() -> None:
	"""Preserve witnesses for every tractate and record each failure."""
	observed_at = datetime.now(timezone.utc).isoformat()
	tractates = []
	failures = []
	for slug, english_title in TRACTATE_TITLES.items():
		try:
			tractates.append(collect_tractate(slug, english_title, observed_at))
		except Exception as error:
			failures.append({
				"source_slug": slug,
				"error": repr(error),
			})
	ledger = {
		"_bh": "B\"H",
		"_blessing": ["Boruch Hashem", "Blessed is He"],
		"retrieved_at": observed_at,
		"tractate_count": len(tractates),
		"failure_count": len(failures),
		"failures": failures,
		"tractates": tractates,
	}
	write_json(OUTPUT_ROOT / "research" / "external-chapter-witnesses.json", ledger)
	if failures:
		raise SystemExit(f"External witness failures: {len(failures)}")


if __name__ == "__main__":
	main()
