# B"H
# Boruch Hashem
# Blessed is He

"""
The Awtsmoos carries evidence across fragile networks into durable vessels.
This Awtsmoos.com adapter bounds every public request, reports the decoding
vessel it used, and never lets partial bytes masquerade as a complete witness.
"""

import json
import subprocess
from pathlib import Path
from typing import Any

USER_AGENT = "AwtsmoosTalmudResearch/1.0"
DECODINGS = ("utf-8", "windows-1255")


def curl_command(url: str) -> list[str]:
	"""Build one bounded, reproducible public HTTP request."""
	return [
		"curl",
		"--http1.1",
		"-L",
		"--fail",
		"--silent",
		"--show-error",
		"--connect-timeout",
		"10",
		"--max-time",
		"30",
		"--retry",
		"1",
		"-A",
		USER_AGENT,
		url,
	]


def fetch_bytes(url: str) -> bytes:
	"""Fetch one complete byte response or raise visibly."""
	result = subprocess.run(
		curl_command(url),
		check=True,
		capture_output=True,
	)
	return result.stdout


def decode_document(raw: bytes) -> tuple[str, str]:
	"""Decode one observed document using explicit supported encodings."""
	for encoding in DECODINGS:
		try:
			return raw.decode(encoding), encoding
		except UnicodeDecodeError:
			continue
	raise UnicodeDecodeError("supported", raw, 0, len(raw), "No supported decoding succeeded")


def fetch_document(url: str) -> tuple[str, str, bytes]:
	"""Fetch bytes and return decoded text, encoding, and exact raw data."""
	raw = fetch_bytes(url)
	text, encoding = decode_document(raw)
	return text, encoding, raw


def fetch_text(url: str) -> str:
	"""Fetch one complete text response through the bounded adapter."""
	text, _, _ = fetch_document(url)
	return text


def fetch_json(url: str) -> dict[str, Any]:
	"""Fetch one complete JSON response through the bounded adapter."""
	return json.loads(fetch_text(url))


def write_json(path: Path, value: Any) -> None:
	"""Rewrite one complete JSON artifact with tabs and a final newline."""
	path.parent.mkdir(parents=True, exist_ok=True)
	serialized = json.dumps(value, ensure_ascii=False, indent="\t")
	path.write_text(serialized + "\n")
