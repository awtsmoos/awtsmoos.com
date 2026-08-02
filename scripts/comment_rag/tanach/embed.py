# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos divides the unfinished tail into two measured rays of light;
Awtsmoos.com counts each worker once while every sealed vessel stays right.
"""
import json
import os
import pathlib
from sentence_transformers import SentenceTransformer
from workerArgs import integer_argument

RAG = pathlib.Path(os.environ.get(
	"AWTSMOOS_RAG_ROOT",
	"/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag"
))
JOB = RAG / "tanach-hebrew-verses-embedding-job"
MANIFEST = JOB / "manifest.jsonl"
PARTS = JOB / "vector-parts"
MODEL_ID = "intfloat/multilingual-e5-small"
MODEL_PATH = pathlib.Path(os.environ.get(
	"AWTSMOOS_TANACH_MODEL_PATH",
	str(RAG / "models" / "multilingual-e5-small")
))
PART_SIZE = integer_argument("part-size", "TANACH_PART_SIZE", 32)
ENCODE_BATCH = integer_argument("encode-batch", "TANACH_ENCODE_BATCH", 32)
START_AT = integer_argument("start-at", "TANACH_START_AT", 0)
LIMIT = integer_argument("limit", "TANACH_EMBED_LIMIT", 0)
WORKER_INDEX = integer_argument("worker", "TANACH_EMBED_WORKER_INDEX", 0)
WORKER_COUNT = integer_argument("workers", "TANACH_EMBED_WORKER_COUNT", 1)


def read_rows():
	with MANIFEST.open(encoding="utf-8") as handle:
		rows = [json.loads(line) for line in handle if line.strip()]
	return rows[:LIMIT] if LIMIT else rows


def valid_part(path, expected):
	if not path.exists():
		return False
	try:
		with path.open(encoding="utf-8") as handle:
			return sum(1 for line in handle if line.strip()) == expected
	except OSError:
		return False


def assigned_parts(total):
	for start in range(START_AT, total, PART_SIZE):
		if ((start - START_AT) // PART_SIZE) % WORKER_COUNT == WORKER_INDEX:
			yield start


def write_progress(completed, assigned, total):
	path = JOB / f"progress-worker-{WORKER_INDEX}.json"
	payload = {
		"BH": 'B"H',
		"worker": WORKER_INDEX,
		"workers": WORKER_COUNT,
		"completed": completed,
		"assigned": assigned,
		"corpusTotal": total,
		"startAt": START_AT,
		"partSize": PART_SIZE,
		"encodeBatch": ENCODE_BATCH,
		"model": MODEL_ID
	}
	stage = path.with_suffix(".tmp")
	stage.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
	stage.replace(path)


def output_row(row, vector):
	return {
		**row,
		"provider": f"sentence-transformers:{MODEL_ID}",
		"realEmbedding": True,
		"dimensions": len(vector),
		"vec": [round(float(value), 8) for value in vector]
	}


def main():
	if WORKER_INDEX < 0 or WORKER_INDEX >= WORKER_COUNT:
		raise RuntimeError("invalid_worker_coordinates")
	if not (MODEL_PATH / "model.safetensors").exists():
		raise RuntimeError(f"sealed_model_missing:{MODEL_PATH}")
	PARTS.mkdir(parents=True, exist_ok=True)
	rows = read_rows()
	starts = list(assigned_parts(len(rows)))
	assigned = sum(len(rows[start:start + PART_SIZE]) for start in starts)
	model = SentenceTransformer(str(MODEL_PATH), local_files_only=True)
	completed = 0
	for start in starts:
		part_rows = rows[start:start + PART_SIZE]
		part = PARTS / f"part-{start:06d}.jsonl"
		if not valid_part(part, len(part_rows)):
			vectors = model.encode(
				[f"passage: {row['text']}" for row in part_rows],
				batch_size=ENCODE_BATCH,
				normalize_embeddings=True,
				show_progress_bar=False,
				convert_to_numpy=True
			)
			stage = pathlib.Path(f"{part}.tmp-{os.getpid()}")
			with stage.open("w", encoding="utf-8") as handle:
				for row, vector in zip(part_rows, vectors):
					handle.write(json.dumps(output_row(row, vector), ensure_ascii=False) + "\n")
			stage.replace(part)
		completed += len(part_rows)
		write_progress(completed, assigned, len(rows))
		print(f'B"H worker {WORKER_INDEX} embedded tail {completed}/{assigned}', flush=True)


if __name__ == "__main__":
	main()
