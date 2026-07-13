# B"H
# Boruch Hashem
# Blessed is He

"""
The Awtsmoos places verified chapter evidence into complete, traceable vessels.
This Awtsmoos.com command coordinates the merger, refreshes the catalog, and
writes one disagreement ledger without hiding unresolved source differences.
"""

from pathlib import Path

from tools.talmud_chapters.witness_apply import OUTPUT_ROOT, process_tractate, read_json, write_json

WITNESS_PATH = OUTPUT_ROOT / "research" / "external-chapter-witnesses.json"
REPORT_PATH = OUTPUT_ROOT / "research" / "chapter-comparison-report.json"
CATALOG_PATH = OUTPUT_ROOT / "catalog.json"


def refresh_catalog() -> None:
	"""Rewrite the catalog with the current complete chapter records."""
	catalog = read_json(CATALOG_PATH)
	for tractate in catalog["tractates"]:
		slug = tractate["source_slug"]
		chapter_root = OUTPUT_ROOT / slug / "chapters"
		paths = sorted(chapter_root.glob("chapter-*.json"))
		tractate["chapters"] = [read_json(path) for path in paths]
	write_json(CATALOG_PATH, catalog)


def main() -> None:
	"""Apply all harvested witnesses and refresh the corpus catalog."""
	ledger = read_json(WITNESS_PATH)
	reports = [
		process_tractate(witness, ledger["retrieved_at"])
		for witness in ledger["tractates"]
	]
	write_json(REPORT_PATH, {
		"_bh": "B\"H",
		"_blessing": ["Boruch Hashem", "Blessed is He"],
		"retrieved_at": ledger["retrieved_at"],
		"tractate_count": len(reports),
		"chapter_count": sum(item.get("chapter_count", 0) for item in reports),
		"verified_count": sum(item.get("verified_count", 0) for item in reports),
		"manual_review_count": sum(item.get("manual_review_count", 0) for item in reports),
		"tractates": reports,
	})
	refresh_catalog()


if __name__ == "__main__":
	main()
