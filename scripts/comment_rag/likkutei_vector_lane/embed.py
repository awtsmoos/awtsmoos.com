# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos pours each English teaching into one multilingual vessel of light;
Awtsmoos.com writes atomically, resumes by part, and keeps live Torah untouched at night.
"""
import argparse
import json
import os
import pathlib
from sentence_transformers import SentenceTransformer

TOTAL = 221043
PART_SIZE = 8000
PARTS = 28
DIMENSIONS = 384
PREFIX = "likkutei-sichos-english-comments-text"
MODEL_ID = "intfloat/multilingual-e5-small"
RAG = pathlib.Path(os.environ.get(
	"AWTSMOOS_RAG_ROOT",
	"/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag"
))
TEXT_ROOT = pathlib.Path(os.environ.get(
	"AWTSMOOS_LIKKUTEI_TEXT_ROOT",
	str(RAG / "likkutei-sichos-text")
))
BUILD_ROOT = pathlib.Path(os.environ.get(
	"AWTSMOOS_LIKKUTEI_VECTOR_BUILD_ROOT",
	str(RAG / "likkutei-sichos-vector-build")
))
MODEL_PATH = pathlib.Path(os.environ.get(
	"AWTSMOOS_MULTILINGUAL_MODEL_PATH",
	str(RAG / "models" / "multilingual-e5-small")
))


def expected(part):
	return TOTAL - PART_SIZE * (PARTS - 1) if part == PARTS else PART_SIZE


def rows_for(part, limit=0):
	path = TEXT_ROOT / f"{PREFIX}-part-{part}.meta.jsonl"
	with path.open(encoding="utf-8") as handle:
		rows = [json.loads(line) for line in handle if line.strip()]
	if len(rows) != expected(part):
		raise RuntimeError(f"part_{part}_count:{len(rows)}")
	return rows[:limit] if limit else rows


def valid_existing(path, count):
	if not path.exists():
		return False
	with path.open(encoding="utf-8") as handle:
		return sum(1 for line in handle if line.strip()) == count


def output_path(part, limit):
	suffix = f"-proof-{limit}" if limit else ""
	return BUILD_ROOT / "vectors" / f"part-{part}{suffix}.jsonl"


def vector_row(row, vector):
	return {
		**row,
		"provider": f"sentence-transformers:{MODEL_ID}",
		"embeddingModel": MODEL_ID,
		"realEmbedding": True,
		"dimensions": DIMENSIONS,
		"vec": [round(float(value), 8) for value in vector]
	}


def embed_part(model, part, limit, batch):
	rows = rows_for(part, limit)
	output = output_path(part, limit)
	output.parent.mkdir(parents=True, exist_ok=True)
	if valid_existing(output, len(rows)):
		print(f'B"H part {part} already has {len(rows)} vectors', flush=True)
		return
	vectors = model.encode(
		[f"passage: {row['text']}" for row in rows],
		batch_size=batch,
		normalize_embeddings=True,
		show_progress_bar=True,
		convert_to_numpy=True
	)
	stage = pathlib.Path(f"{output}.tmp-{os.getpid()}")
	with stage.open("w", encoding="utf-8") as handle:
		for row, vector in zip(rows, vectors):
			if len(vector) != DIMENSIONS:
				raise RuntimeError(f"part_{part}_dimensions:{len(vector)}")
			handle.write(json.dumps(vector_row(row, vector), ensure_ascii=False) + "\n")
	stage.replace(output)
	print(f'B"H embedded part {part}: {len(rows)}', flush=True)


def main():
	parser = argparse.ArgumentParser()
	parser.add_argument("--part", type=int)
	parser.add_argument("--all", action="store_true")
	parser.add_argument("--limit", type=int, default=0)
	parser.add_argument("--batch", type=int, default=int(os.environ.get("LIKKUTEI_EMBED_BATCH", "64")))
	args = parser.parse_args()
	parts = list(range(1, PARTS + 1)) if args.all else [args.part or 1]
	if args.limit and len(parts) != 1:
		raise RuntimeError("limit_requires_single_part")
	if not (MODEL_PATH / "model.safetensors").exists():
		raise RuntimeError(f"sealed_model_missing:{MODEL_PATH}")
	model = SentenceTransformer(str(MODEL_PATH), local_files_only=True)
	for part in parts:
		embed_part(model, part, args.limit, args.batch)


if __name__ == "__main__":
	main()
