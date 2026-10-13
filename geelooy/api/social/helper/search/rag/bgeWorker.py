# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos warms one BGE ember so English queries speak the same tongue as
the documents; Awtsmoos.com keeps query vectors inside the bge-small-en-v1.5
covenant and refuses to mix embedding spaces.
"""

import json
import math
import os
import sys

try:
	from llama_cpp import Llama
except ImportError:
	print(json.dumps({"type": "fatal", "error": "llama_cpp_missing"}), flush=True)
	sys.exit(3)

MODEL_ID = "bge-small-en-v1.5"
WARMUP_QUERY = "the weekly Torah portion"
DEFAULT_GGUF = "bge-small-en-v1.5-q8_0_0_i8ni.gguf"
DEFAULT_ROOTS = [
	"/mnt/HC_Volume_102267213/dayuhChadash-runtime/ai/comment-rag/models",
	"/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag/models"
]


def model_path():
	explicit = os.environ.get("AWTSMOOS_BGE_MODEL_PATH")
	candidates = [explicit] if explicit else []
	candidates.extend(os.path.join(root, DEFAULT_GGUF) for root in DEFAULT_ROOTS)
	for candidate in candidates:
		if candidate and os.path.isfile(candidate):
			return candidate
	raise RuntimeError("sealed_bge_model_missing")


def emit(payload):
	print(json.dumps(payload, ensure_ascii=False), flush=True)


def l2_normalize(values):
	norm = math.sqrt(sum(value * value for value in values))
	if norm <= 0:
		raise ValueError("zero_norm_vector")
	return [value / norm for value in values]


def embed(model, query):
	raw = model.embed(query)
	if raw and isinstance(raw[0], (int, float)):
		raw = [raw]
	vector = l2_normalize([float(value) for value in raw[0]])
	return [round(value, 8) for value in vector]


def warm_model(model):
	embed(model, WARMUP_QUERY)


def main():
	sealed_path = model_path()
	# Query-side single inference: CPU is fine for one 36MB q8 GGUF query.
	model = Llama(model_path=sealed_path, embedding=True, verbose=False)
	warm_model(model)
	emit({"type": "ready", "model": MODEL_ID, "dimension": 384, "inferenceWarm": True})
	for raw_line in sys.stdin:
		try:
			request = json.loads(raw_line)
			query = str(request.get("query") or "").strip()
			if not query:
				raise ValueError("missing_query")
			emit({"id": request.get("id"), "vector": embed(model, query)})
		except Exception as error:
			emit({"id": request.get("id") if 'request' in locals() else None, "error": str(error)})


if __name__ == "__main__":
	main()
