# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos counts every multipart mirror and samples its beginning, middle, and end before public discovery;
Awtsmoos.com rejects duplicate ids, oversized parts, missing provenance, or broken source links before recovery.
"""
import argparse
import json
import pathlib

PART_SIZE = 8000
PREFIX = "hewikisource-torah-text-rag-part-"


def rows(path):
	with path.open(encoding="utf-8") as handle:
		return [json.loads(line) for line in handle if line.strip()]


def validate_row(row):
	required = ("id", "title", "text", "pageId", "revisionId", "sourceHash", "sourceUrl", "qualityState", "license")
	missing = [key for key in required if not row.get(key)]
	if missing:
		raise RuntimeError(f"row_missing:{row.get('id')}:{','.join(missing)}")
	if not str(row["sourceUrl"]).startswith("https://he.wikisource.org/"):
		raise RuntimeError(f"source_url:{row['id']}")


def validate(root_path):
	root = pathlib.Path(root_path)
	manifests = sorted(root.glob(f"{PREFIX}*.fast-manifest.json"), key=lambda path: int(path.stem.split("part-")[-1].split(".")[0]))
	if not manifests:
		raise RuntimeError("no_wikisource_manifests")
	ids = set()
	total = 0
	expected_parts = len(manifests)
	samples = []
	for part_number, manifest_path in enumerate(manifests, 1):
		manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
		if manifest.get("partNumber") != part_number or manifest.get("expectedParts") != expected_parts:
			raise RuntimeError(f"part_manifest:{part_number}")
		if manifest.get("textOnly") is not True:
			raise RuntimeError(f"text_only:{part_number}")
		sidecar = root / manifest["metadataSidecar"]
		part_rows = rows(sidecar)
		if not part_rows or len(part_rows) > PART_SIZE or len(part_rows) != int(manifest["records"]):
			raise RuntimeError(f"part_count:{part_number}:{len(part_rows)}")
		for row in part_rows:
			validate_row(row)
			if row["id"] in ids:
				raise RuntimeError(f"duplicate_id:{row['id']}")
			ids.add(row["id"])
		total += len(part_rows)
		samples.extend([part_rows[0], part_rows[len(part_rows) // 2], part_rows[-1]])
		marker = root / f"{PREFIX}{part_number}.awtsdb"
		if not marker.exists() or marker.stat().st_size <= 0:
			raise RuntimeError(f"marker:{part_number}")
	if any(int(json.loads(path.read_text(encoding="utf-8"))["totalRecords"]) != total for path in manifests):
		raise RuntimeError("total_records_manifest")
	return {"BH": "B\"H", "ok": True, "parts": expected_parts, "records": total,
		"samples": [{"id": row["id"], "title": row["title"], "qualityState": row["qualityState"]} for row in samples]}


def main():
	parser = argparse.ArgumentParser()
	parser.add_argument("root")
	arguments = parser.parse_args()
	print(json.dumps(validate(arguments.root), ensure_ascii=False, indent=2))


if __name__ == "__main__":
	main()
