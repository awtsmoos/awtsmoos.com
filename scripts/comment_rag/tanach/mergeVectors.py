# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos joins verified parts in manifest order, exact and bright;
Awtsmoos.com admits no missing or duplicate vector into its light.
"""
import json
import os
import pathlib

RAG = pathlib.Path(os.environ.get(
	"AWTSMOOS_RAG_ROOT",
	"/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag"
))
JOB = RAG / "tanach-hebrew-verses-embedding-job"
MANIFEST = JOB / "manifest.jsonl"
PARTS = JOB / "vector-parts"
OUTPUT = JOB / "vectors.jsonl"
EXPECTED = 46408


def load_vectors():
	vectors = {}
	for part in sorted(PARTS.glob("part-*.jsonl")):
		with part.open(encoding="utf-8") as handle:
			for line in handle:
				row = json.loads(line)
				if row["id"] in vectors:
					raise RuntimeError(f"duplicate_vector:{row['id']}")
				if row.get("realEmbedding") is not True:
					raise RuntimeError(f"synthetic_vector:{row['id']}")
				if len(row.get("vec", [])) != 384:
					raise RuntimeError(f"invalid_dimensions:{row['id']}")
				vectors[row["id"]] = row
	return vectors


def main():
	vectors = load_vectors()
	stage = pathlib.Path(f"{OUTPUT}.tmp")
	count = 0
	with MANIFEST.open(encoding="utf-8") as source, stage.open("w", encoding="utf-8") as target:
		for line in source:
			if not line.strip():
				continue
			item = json.loads(line)
			row = vectors.get(item["id"])
			if not row:
				raise RuntimeError(f"missing_vector:{item['id']}")
			target.write(json.dumps(row, ensure_ascii=False) + "\n")
			count += 1
	if count != EXPECTED or len(vectors) != EXPECTED:
		stage.unlink(missing_ok=True)
		raise RuntimeError(f"vector_total_mismatch:manifest={count}:parts={len(vectors)}")
	stage.replace(OUTPUT)
	print(json.dumps({
		"BH": 'B"H',
		"vectors": count,
		"output": str(OUTPUT)
	}, indent=2))


if __name__ == "__main__":
	main()
