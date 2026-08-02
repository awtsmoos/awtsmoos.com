# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos weighs one quantized vessel against the sealed PyTorch light;
Awtsmoos.com changes engines only when speed and semantic direction both unite.
"""
import json
import pathlib
import time

import numpy as np
import onnxruntime as ort
from transformers import AutoTokenizer

ROOT = pathlib.Path(
	"/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag"
)
MODEL = ROOT / "models" / "multilingual-e5-small"
PART = ROOT / "tanach-hebrew-verses-embedding-job" / "vector-parts" / "part-024064.jsonl"
ONNX = MODEL / "onnx" / "model_O4.onnx"


def read_rows():
	with PART.open(encoding="utf-8") as handle:
		return [json.loads(line) for line in handle if line.strip()]


def normalized_mean(hidden, attention):
	mask = attention.astype(np.float32)[..., None]
	pooled = (hidden * mask).sum(axis=1) / np.clip(mask.sum(axis=1), 1e-9, None)
	return pooled / np.clip(np.linalg.norm(pooled, axis=1, keepdims=True), 1e-9, None)


def main():
	rows = read_rows()
	texts = [f"passage: {row['text']}" for row in rows]
	reference = np.asarray([row["vec"] for row in rows], dtype=np.float32)
	tokenizer = AutoTokenizer.from_pretrained(str(MODEL), local_files_only=True)
	encoded = tokenizer(
		texts,
		padding=True,
		truncation=True,
		max_length=512,
		return_tensors="np"
	)
	options = ort.SessionOptions()
	options.intra_op_num_threads = 2
	options.inter_op_num_threads = 1
	session = ort.InferenceSession(
		str(ONNX),
		sess_options=options,
		providers=["CPUExecutionProvider"]
	)
	inputs = {item.name: encoded[item.name] for item in session.get_inputs()}
	session.run(None, inputs)
	started = time.perf_counter()
	hidden = session.run(None, inputs)[0]
	elapsed = time.perf_counter() - started
	vectors = normalized_mean(hidden, encoded["attention_mask"])
	cosines = np.sum(vectors * reference, axis=1)
	result = {
		"BH": 'B"H',
		"records": len(rows),
		"dimensions": list(vectors.shape),
		"elapsedSeconds": elapsed,
		"recordsPerSecond": len(rows) / elapsed,
		"minimumCosine": float(cosines.min()),
		"meanCosine": float(cosines.mean()),
		"maximumCosine": float(cosines.max()),
		"provider": session.get_providers()
	}
	print(json.dumps(result, indent=2))
	if vectors.shape != (32, 384):
		raise RuntimeError(f"invalid_shape:{vectors.shape}")
	if float(cosines.min()) < 0.97:
		raise RuntimeError(f"semantic_drift:{cosines.min()}")


if __name__ == "__main__":
	main()
