# B"H
# Boruch Hashem
# Blessed is He

"""
The Awtsmoos places verified names into vessels without hiding one dissent.
This Awtsmoos.com command rewrites each complete chapter file only after local,
Sefaria, and Mechon Mamre records can be joined by exact tractate and ordinal.
"""

import json
from pathlib import Path
from typing import Any

from tools.talmud_chapters.research_merge import merge_chapter

OUTPUT_ROOT = Path("/Users/awtsmoos/Documents/awtsmoos/docs/Torah/Talmud-Chapters")
SEFARIA_PATH = OUTPUT_ROOT / "research" / "sefaria-chapter-witnesses.json"
MECHON_PATH = OUTPUT_ROOT / "research" / "mechon-chapter-witnesses.json"


def read_json(path: Path) -> Any:
	"""Read one complete JSON artifact."""
	return json.loads(path.read_text())


def write_json(path: Path, value: Any) -> None:
	"""Rewrite one complete JSON artifact with tab indentation."""
	path.write_text(json.dumps(value, ensure_ascii=False, indent="\t") + "\n")


def sefaria_index(ledger: dict[str, Any]) -> dict[tuple[str, int], dict[str, Any]]:
	"""Index every Sefaria chapter while retaining its tractate URL."""
	result = {}
	for tractate in ledger["tractates"]:
		for chapter in tractate["chapters"]:
			result[(tractate["source_slug"], chapter["chapter_number"])] = {
				**chapter,
				"url": tractate["url"],
			}
	return result


def mechon_index(ledger: dict[str, Any]) -> dict[tuple[str, int], dict[str, Any]]:
	"""Index every Mechon chapter by exact local key."""
	return {
		(item["source_slug"], item["chapter_number"]): item
		for item in ledger["chapters"]
	}


def refresh_catalog() -> None:
	"""Rewrite the catalog with the current complete chapter records."""
	catalog_path = OUTPUT_ROOT / "catalog.json"
	catalog = read_json(catalog_path)
	for tractate in catalog["tractates"]:
		slug = tractate["source_slug"]
		paths = sorted((OUTPUT_ROOT / slug / "chapters").glob("chapter-*.json"))
		tractate["chapters"] = [read_json(path) for path in paths]
	write_json(catalog_path, catalog)


def main() -> None:
	"""Merge all available evidence and write a disagreement-aware report."""
	sefaria_ledger = read_json(SEFARIA_PATH)
	mechon_ledger = read_json(MECHON_PATH)
	sefaria = sefaria_index(sefaria_ledger)
	mechon = mechon_index(mechon_ledger)
	keys = sorted(set(sefaria) | set(mechon))
	missing = [
		{"source_slug": slug, "chapter_number": number}
		for slug, number in keys
		if (slug, number) not in sefaria or (slug, number) not in mechon
	]
	if missing:
		raise SystemExit(f"External witness keys do not align: {len(missing)}")
	reports = []
	for slug, number in keys:
		path = OUTPUT_ROOT / slug / "chapters" / f"chapter-{number:02d}.json"
		local = read_json(path)
		merged = merge_chapter(
			local,
			sefaria[(slug, number)],
			mechon[(slug, number)],
			sefaria_ledger["retrieved_at"],
			mechon_ledger["retrieved_at"],
		)
		write_json(path, merged)
		reports.append({
			"source_slug": slug,
			"chapter_number": number,
			"status": merged["name_verification_status"],
			"checks": merged["verification_checks"],
		})
	write_json(OUTPUT_ROOT / "research" / "chapter-comparison-report.json", {
		"_bh": "B\"H",
		"_blessing": ["Boruch Hashem", "Blessed is He"],
		"chapter_count": len(reports),
		"verified_count": sum(item["status"].startswith("verified") for item in reports),
		"manual_review_count": sum(not item["status"].startswith("verified") for item in reports),
		"chapters": reports,
	})
	refresh_catalog()


if __name__ == "__main__":
	main()
