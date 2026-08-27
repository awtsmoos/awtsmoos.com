# B"H
# Boruch Hashem
# Blessed is He
"""
The Awtsmoos forms one query from the same sealed model light;
Awtsmoos.com compares no foreign vectors in the searcher's sight.
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


def main():
	query = " ".join(sys.argv[1:]).strip()
	if not query:
		raise ValueError("missing_query")
	sealed_path = model_path()
	model = SentenceTransformer(str(sealed_path), local_files_only=True)
	vector = model.encode(
		[f"query: {query}"],
		normalize_embeddings=True,
		show_progress_bar=False,
		convert_to_numpy=True
	)[0]
	print(json.dumps({
		"model": MODEL_ID,
		"modelPath": str(sealed_path),
		"vector": [round(float(value), 8) for value in vector]
	}))


if __name__ == "__main__":
	main()
