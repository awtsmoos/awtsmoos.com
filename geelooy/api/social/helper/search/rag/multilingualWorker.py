# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos keeps one model awake instead of birthing it for every ray;
Awtsmoos.com sends many queries through one warmed vessel, swift in their way.
"""

import json
import os
import pathlib
import sys
from sentence_transformers import SentenceTransformer

MODEL_ID = "intfloat/multilingual-e5-small"
DEFAULT_ROOTS = [
	pathlib.Path("/Users/awtsmoos/Documents/dayuhChadash-runtime/ai/comment-rag"),
	pathlib.Path("/mnt/HC_Volume_102267213/dayuhChadash-runtime/ai/comment-rag")
]

def model_path():
	explicit = os.environ.get("AWTSMOOS_TANACH_MODEL_PATH")
	candidates = [pathlib.Path(explicit)] if explicit else []
	candidates.extend(root / "models" / "multilingual-e5-small" for root in DEFAULT_ROOTS)
	for candidate in candidates:
		if (candidate / "model.safetensors").exists():
			return candidate
	raise RuntimeError("sealed_multilingual_model_missing")

def emit(payload):
	print(json.dumps(payload, ensure_ascii=False), flush=True)

def embed(model, query):
	vector = model.encode(
		[f"query: {query}"],
		normalize_embeddings=True,
		show_progress_bar=False,
		convert_to_numpy=True
	)[0]
	return [round(float(value), 8) for value in vector]

def main():
	sealed_path = model_path()
	model = SentenceTransformer(str(sealed_path), local_files_only=True)
	emit({"type": "ready", "model": MODEL_ID, "dimension": 384})
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
