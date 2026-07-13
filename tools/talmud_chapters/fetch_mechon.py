# B"H
# Boruch Hashem
# Blessed is He

"""
The Awtsmoos lets the Vilna-based witness speak perek by perek.
This Awtsmoos.com collector preserves each Mechon Mamre page, extracts explicit
amud boundaries, and compares its Mishnah opening with the local source.
"""

import hashlib
import json
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from tools.talmud_chapters.mechon_codes import MECHON_CODES, url_for_chapter
from tools.talmud_chapters.mechon_parser import parse_chapter
from tools.talmud_chapters.research_http import fetch_document, write_json

OUTPUT_ROOT = Path("/Users/awtsmoos/Documents/awtsmoos/docs/Torah/Talmud-Chapters")
SNAPSHOT_ROOT = OUTPUT_ROOT / "research" / "snapshots" / "mechon-mamre"


def read_json(path: Path) -> Any:
	"""Read one complete local JSON artifact."""
	return json.loads(path.read_text())


def normalize(value: str) -> str:
	"""Normalize an observed Hebrew incipit only for conservative comparison."""
	return re.sub(r"[^א-ת]", "", value)


def collect_chapter(slug: str, chapter_number: int) -> dict[str, Any]:
	"""Fetch, preserve, parse, and compare one Mechon Mamre perek page."""
	url = url_for_chapter(slug, chapter_number)
	document, encoding, raw = fetch_document(url)
	snapshot_path = SNAPSHOT_ROOT / slug / f"chapter-{chapter_number:02d}.html"
	snapshot_path.parent.mkdir(parents=True, exist_ok=True)
	snapshot_path.write_bytes(raw)
	observed = parse_chapter(document)
	local_path = OUTPUT_ROOT / slug / "chapters" / f"chapter-{chapter_number:02d}.json"
	local = read_json(local_path)
	local_start = (local["first_coordinate"]["daf"], local["first_coordinate"]["amud"])
	local_end = (local["last_coordinate"]["daf"], local["last_coordinate"]["amud"])
	mechon_start = (observed["first_daf"], observed["first_amud"])
	mechon_end = (observed["last_daf"], observed["last_amud"])
	local_incipit = normalize(local["observed_first_mishna_incipit"])
	mechon_incipit = normalize(observed["opening_mishna_incipit"])
	return {
		"source_slug": slug,
		"chapter_number": chapter_number,
		"url": url,
		"snapshot_path": str(snapshot_path.relative_to(OUTPUT_ROOT)),
		"snapshot_sha256": hashlib.sha256(raw).hexdigest(),
		"encoding": encoding,
		"mechon": observed,
		"local_start": list(local_start),
		"local_end": list(local_end),
		"start_amud_match": mechon_start == local_start,
		"end_amud_match": mechon_end == local_end,
		"incipit_match": bool(local_incipit) and mechon_incipit.startswith(local_incipit),
	}


def work_items() -> list[tuple[str, int]]:
	"""Return all 306 observed local chapter coordinates."""
	items = []
	for slug in MECHON_CODES:
		metadata = read_json(OUTPUT_ROOT / slug / "metadata" / "tractate.json")
		items.extend((slug, number) for number in range(1, metadata["chapter_count"] + 1))
	return items


def main() -> None:
	"""Collect all Mechon witnesses concurrently and record every failure."""
	observed_at = datetime.now(timezone.utc).isoformat()
	chapters = []
	failures = []
	with ThreadPoolExecutor(max_workers=6) as executor:
		futures = {
			executor.submit(collect_chapter, slug, number): (slug, number)
			for slug, number in work_items()
		}
		for future in as_completed(futures):
			slug, number = futures[future]
			try:
				chapters.append(future.result())
			except Exception as error:
				failures.append({
					"source_slug": slug,
					"chapter_number": number,
					"error": repr(error),
				})
	chapters.sort(key=lambda item: (item["source_slug"], item["chapter_number"]))
	failures.sort(key=lambda item: (item["source_slug"], item["chapter_number"]))
	ledger = {
		"_bh": "B\"H",
		"_blessing": ["Boruch Hashem", "Blessed is He"],
		"retrieved_at": observed_at,
		"chapter_count": len(chapters),
		"failure_count": len(failures),
		"failures": failures,
		"chapters": chapters,
	}
	write_json(OUTPUT_ROOT / "research" / "mechon-chapter-witnesses.json", ledger)
	if failures:
		raise SystemExit(f"Mechon Mamre witness failures: {len(failures)}")


if __name__ == "__main__":
	main()
