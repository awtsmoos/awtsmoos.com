# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos divides validated Torah pages into bounded mirrors where every searched row remains in sight;
Awtsmoos.com publishes multipart manifests atomically so latency limits never conceal the later source light.
"""
import argparse
import json
import math
import pathlib
import sqlite3
from candidates import merge_candidates
from records import build_record

LANE = "hewikisource-torah-text-rag"
PART_SIZE = 8000


def require_source_validation(path):
	validation = json.loads(pathlib.Path(path).read_text(encoding="utf-8"))
	if validation.get("ok") is not True:
		raise RuntimeError("source_validation_not_green")
	if int(validation.get("unresolvedCategoryTargets", -1)) != 0:
		raise RuntimeError("source_categories_unresolved")
	if int(validation.get("unresolvedTemplateTargets", -1)) != 0:
		raise RuntimeError("source_templates_unresolved")
	return validation


def page_row(connection, page_id):
	row = connection.execute(
		"SELECT page_id,title,revision_id,revision_timestamp,upstream_sha1,wikitext,local_sha256 "
		"FROM pages WHERE page_id=? AND namespace=0",
		(page_id,)
	).fetchone()
	if not row:
		return None
	keys = ("page_id", "title", "revision_id", "revision_timestamp", "upstream_sha1", "wikitext", "local_sha256")
	return dict(zip(keys, row))


def selected_records(database, candidates):
	connection = sqlite3.connect(database)
	try:
		for candidate in merge_candidates(candidates):
			page = page_row(connection, int(candidate["pageId"]))
			record = None if page is None else build_record(candidate, page)
			if record is not None:
				yield record
	finally:
		connection.close()


def manifest(part_number, expected_parts, count, total_records):
	base = f"{LANE}-part-{part_number}"
	return {
		"BH": "B\"H", "id": "hewikisource-torah", "title": "Hebrew Wikisource Torah",
		"aliases": ["wikisource", "wikimedia", "hebrew-wikisource"], "corpusId": "hewikisource-torah",
		"records": count, "listLength": count, "totalRecords": total_records,
		"dimensions": 0, "textOnly": True, "indexType": "text-only",
		"metadataSidecar": f"{base}.meta.jsonl", "partNumber": part_number,
		"expectedParts": expected_parts, "sourceProject": "hewikisource", "dumpDate": "20260801"
	}


def publish(database, candidates, validation_path, output_root):
	require_source_validation(validation_path)
	records = list(selected_records(database, candidates))
	if not records:
		raise RuntimeError("no_publishable_wikisource_records")
	root = pathlib.Path(output_root)
	root.mkdir(parents=True, exist_ok=True)
	expected_parts = math.ceil(len(records) / PART_SIZE)
	for part_number in range(1, expected_parts + 1):
		start = (part_number - 1) * PART_SIZE
		part = records[start:start + PART_SIZE]
		base = root / f"{LANE}-part-{part_number}"
		sidecar = pathlib.Path(f"{base}.meta.jsonl")
		stage = pathlib.Path(f"{sidecar}.tmp")
		with stage.open("w", encoding="utf-8") as output:
			for record in part:
				output.write(json.dumps(record, ensure_ascii=False) + "\n")
		stage.replace(sidecar)
		manifest_path = pathlib.Path(f"{base}.fast-manifest.json")
		manifest_stage = pathlib.Path(f"{manifest_path}.tmp")
		manifest_stage.write_text(
			json.dumps(manifest(part_number, expected_parts, len(part), len(records)), ensure_ascii=False, indent=2) + "\n",
			encoding="utf-8"
		)
		manifest_stage.replace(manifest_path)
	return {"BH": "B\"H", "records": len(records), "parts": expected_parts, "partSize": PART_SIZE}


def main():
	parser = argparse.ArgumentParser()
	parser.add_argument("database")
	parser.add_argument("candidates")
	parser.add_argument("validation")
	parser.add_argument("output_root")
	arguments = parser.parse_args()
	print(json.dumps(publish(arguments.database, arguments.candidates, arguments.validation, arguments.output_root), ensure_ascii=False, indent=2))


if __name__ == "__main__":
	main()
