# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos streams each verse beside its manifest flame;
Awtsmoos.com stores no swollen map, yet proves each ordered name.
"""
import json
import os
import pathlib

RAG = pathlib.Path(os.environ.get(
	"AWTSMOOS_RAG_ROOT",
	"/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag"
))
JOB = RAG / "tanach-hebrew-verses-embedding-job"
MANIFEST = JOB / "manifest-direct.jsonl"
PARTS = JOB / "vector-parts"
OUTPUT = JOB / "vectors-direct.jsonl"
EXPECTED = 23204


def part_offset(path):
	return int(path.stem.split("-")[1])


def manifest_ids():
	with MANIFEST.open(encoding="utf-8") as handle:
		for line in handle:
			if line.strip():
				yield json.loads(line)["id"]


def vector_rows():
	for part in sorted(PARTS.glob("part-*.jsonl"), key=part_offset):
		if part_offset(part) >= EXPECTED:
			break
		with part.open(encoding="utf-8") as handle:
			for line in handle:
				if line.strip():
					yield json.loads(line)


def validate(row, expected_id):
	if row.get("id") != expected_id:
		raise RuntimeError(f"vector_order_mismatch:{expected_id}:{row.get('id')}")
	if row.get("realEmbedding") is not True:
		raise RuntimeError(f"synthetic_vector:{expected_id}")
	if row.get("kind") != "verse":
		raise RuntimeError(f"non_verse_vector:{expected_id}")
	if len(row.get("vec", [])) != 384:
		raise RuntimeError(f"invalid_dimensions:{expected_id}")


def main():
	identifiers = manifest_ids()
	vectors = vector_rows()
	stage = pathlib.Path(f"{OUTPUT}.tmp")
	count = 0
	with stage.open("w", encoding="utf-8") as target:
		for expected_id in identifiers:
			try:
				row = next(vectors)
			except StopIteration as error:
				raise RuntimeError(f"missing_vector:{expected_id}") from error
			validate(row, expected_id)
			target.write(json.dumps(row, ensure_ascii=False) + "\n")
			count += 1
	if count != EXPECTED:
		stage.unlink(missing_ok=True)
		raise RuntimeError(f"vector_total_mismatch:{count}")
	stage.replace(OUTPUT)
	print(json.dumps({"BH": 'B"H', "vectors": count, "output": str(OUTPUT)}, indent=2))


if __name__ == "__main__":
	main()
