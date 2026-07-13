# B"H
# Boruch Hashem
# Blessed is He

"""
The Awtsmoos lets one witness speak clearly before another is summoned.
This Awtsmoos.com fetcher preserves Sefaria's chapter names and exact ranges
without letting a separate Wikimedia failure erase successfully observed data.
"""

from datetime import datetime, timezone
from pathlib import Path

from tools.talmud_chapters.research_http import fetch_json, write_json
from tools.talmud_chapters.tractates import TRACTATE_TITLES

OUTPUT_ROOT = Path("/Users/awtsmoos/Documents/awtsmoos/docs/Torah/Talmud-Chapters")
SNAPSHOT_ROOT = OUTPUT_ROOT / "research" / "snapshots" / "sefaria"


def primary_hebrew_title(index: dict) -> str:
	"""Return the primary Hebrew tractate title from one Sefaria schema."""
	for title in index["schema"]["titles"]:
		if title.get("lang") == "he" and title.get("primary"):
			return title["text"]
	raise ValueError(f"Missing Hebrew title for {index.get('title')}")


def chapters(index: dict) -> list[dict]:
	"""Extract traditional perek names and wholeRef ranges from Sefaria."""
	result = []
	for node in index["alt_structs"]["Chapters"]["nodes"]:
		titles = {
			item["lang"]: item["text"]
			for item in node["titles"]
			if item.get("primary")
		}
		result.append({
			"chapter_number": node["numeric_equivalent"],
			"chapter_name_hebrew": titles.get("he"),
			"chapter_name_english": titles.get("en"),
			"whole_ref": node["wholeRef"],
		})
	return result


def collect(slug: str, english_title: str) -> dict:
	"""Fetch, preserve, and summarize one Sefaria tractate index."""
	encoded_title = english_title.replace(" ", "%20")
	url = f"https://www.sefaria.org/api/v2/raw/index/{encoded_title}"
	index = fetch_json(url)
	write_json(SNAPSHOT_ROOT / f"{slug}.json", index)
	return {
		"source_slug": slug,
		"sefaria_title": index["title"],
		"sefaria_hebrew_title": primary_hebrew_title(index),
		"url": url,
		"chapters": chapters(index),
	}


def main() -> None:
	"""Fetch all Sefaria witnesses and record any isolated failures."""
	observed_at = datetime.now(timezone.utc).isoformat()
	tractates = []
	failures = []
	for slug, title in TRACTATE_TITLES.items():
		try:
			tractates.append(collect(slug, title))
		except Exception as error:
			failures.append({"source_slug": slug, "error": repr(error)})
	ledger = {
		"_bh": "B\"H",
		"_blessing": ["Boruch Hashem", "Blessed is He"],
		"retrieved_at": observed_at,
		"tractate_count": len(tractates),
		"failure_count": len(failures),
		"failures": failures,
		"tractates": tractates,
	}
	write_json(OUTPUT_ROOT / "research" / "sefaria-chapter-witnesses.json", ledger)
	if failures:
		raise SystemExit(f"Sefaria witness failures: {len(failures)}")


if __name__ == "__main__":
	main()
